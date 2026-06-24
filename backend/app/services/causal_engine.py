"""Causal inference engine: what drives engagement outcomes."""
import pandas as pd
import numpy as np
from typing import Optional
import statsmodels.api as sm
from scipy import stats
import anthropic
from ..core.config import settings


def _interpret_finding(
    treatment: str,
    outcome: str,
    ate: float,
    p_value: float,
    ci_lower: float,
    ci_upper: float,
    outcome_mean: float,
) -> str:
    """Use Claude to write a plain-English interpretation of a causal finding."""
    pct_change = (ate / outcome_mean * 100) if outcome_mean != 0 else 0
    significance = "statistically significant" if p_value < 0.05 else "not statistically significant"
    direction = "increases" if ate > 0 else "decreases"

    client = anthropic.Anthropic(api_key=settings.anthropic_api_key)
    response = client.messages.create(
        model="claude-haiku-4-5-20251001",
        max_tokens=256,
        messages=[{
            "role": "user",
            "content": (
                f"Write a 2-sentence plain-English explanation of this causal finding for a marketer:\n"
                f"Treatment: {treatment}\n"
                f"Outcome: {outcome}\n"
                f"Average treatment effect: {ate:.2f} ({pct_change:+.1f}% change)\n"
                f"95% CI: [{ci_lower:.2f}, {ci_upper:.2f}]\n"
                f"p-value: {p_value:.4f} ({significance})\n"
                "Be concrete and actionable. No jargon."
            )
        }],
    )
    return response.content[0].text.strip()


def run_ols_causal(
    df: pd.DataFrame,
    treatment_col: str,
    outcome_col: str,
    controls: Optional[list[str]] = None,
) -> dict:
    """Simple OLS with optional controls as a fast causal estimate."""
    cols = [treatment_col] + (controls or [])
    X = df[cols].copy()
    X = sm.add_constant(X)
    y = df[outcome_col]

    model = sm.OLS(y, X).fit(cov_type="HC3")

    ate = model.params[treatment_col]
    p_value = model.pvalues[treatment_col]
    ci = model.conf_int(alpha=0.05).loc[treatment_col]

    return {
        "method": "OLS+HC3",
        "ate": float(ate),
        "p_value": float(p_value),
        "ci_lower": float(ci[0]),
        "ci_upper": float(ci[1]),
        "r_squared": float(model.rsquared),
        "n_obs": int(len(df)),
    }


def run_did_causal(
    df: pd.DataFrame,
    treatment_col: str,
    outcome_col: str,
    time_col: str,
    unit_col: str,
) -> dict:
    """Difference-in-Differences estimator."""
    df = df.copy()
    post = (df[time_col] >= df[time_col].median()).astype(int)
    df["post"] = post
    df["did"] = df[treatment_col] * df["post"]

    X = sm.add_constant(df[[treatment_col, "post", "did"]])
    y = df[outcome_col]
    model = sm.OLS(y, X).fit(cov_type="HC3")

    ate = model.params["did"]
    p_value = model.pvalues["did"]
    ci = model.conf_int(alpha=0.05).loc["did"]

    return {
        "method": "DiD",
        "ate": float(ate),
        "p_value": float(p_value),
        "ci_lower": float(ci[0]),
        "ci_upper": float(ci[1]),
        "n_obs": int(len(df)),
    }


TREATMENT_GENERATORS = {
    "post_on_weekend": lambda df: (pd.to_datetime(df["scheduled_at"]).dt.dayofweek >= 5).astype(int),
    "post_morning": lambda df: (pd.to_datetime(df["scheduled_at"]).dt.hour.between(6, 11)).astype(int),
    "post_evening": lambda df: (pd.to_datetime(df["scheduled_at"]).dt.hour.between(17, 21)).astype(int),
    "has_hashtags": lambda df: (df["hashtags_count"] > 0).astype(int),
    "many_hashtags": lambda df: (df["hashtags_count"] > 5).astype(int),
    "has_media": lambda df: (df["media_count"] > 0).astype(int),
    "ai_generated": lambda df: df["ai_generated"].astype(int),
    "long_post": lambda df: (df["char_count"] > 200).astype(int),
    "has_cta": lambda df: df["body"].str.lower().str.contains(
        r"click|link|bio|comment|share|follow|subscribe", regex=True
    ).astype(int),
}


def analyze_user_posts(posts_data: list[dict], outcome: str = "engagements") -> list[dict]:
    """
    Run a battery of causal tests on a user's post history.
    Returns a ranked list of CausalInsight dicts.
    """
    if len(posts_data) < 30:
        return []

    df = pd.DataFrame(posts_data)
    df["engagements"] = (
        df["metrics"].apply(lambda m: sum(v.get("likes", 0) + v.get("shares", 0)
                                          + v.get("comments", 0) for v in m.values()))
        if "metrics" in df.columns else pd.Series(0, index=df.index)
    )
    df["impressions"] = (
        df["metrics"].apply(lambda m: sum(v.get("impressions", 0) for v in m.values()))
        if "metrics" in df.columns else pd.Series(0, index=df.index)
    )
    df["char_count"] = df.get("body", pd.Series("", index=df.index)).str.len()
    df["hashtags_count"] = df.get("hashtags", pd.Series([], index=df.index)).apply(
        lambda x: len(x) if isinstance(x, list) else 0
    )
    df["media_count"] = df.get("media_urls", pd.Series([], index=df.index)).apply(
        lambda x: len(x) if isinstance(x, list) else 0
    )

    outcome_col = outcome if outcome in df.columns else "engagements"
    outcome_mean = df[outcome_col].mean()

    insights = []
    for treatment_name, gen_fn in TREATMENT_GENERATORS.items():
        try:
            df["_t"] = gen_fn(df)
            if df["_t"].nunique() < 2 or df["_t"].sum() < 5:
                continue
            result = run_ols_causal(df, "_t", outcome_col)
            interpretation = _interpret_finding(
                treatment_name, outcome_col,
                result["ate"], result["p_value"],
                result["ci_lower"], result["ci_upper"],
                outcome_mean,
            )
            insights.append({
                "treatment": treatment_name,
                "outcome": outcome_col,
                "ate": result["ate"],
                "ci_lower": result["ci_lower"],
                "ci_upper": result["ci_upper"],
                "p_value": result["p_value"],
                "method": result["method"],
                "interpretation": interpretation,
                "significant": result["p_value"] < 0.05,
                "effect_size_pct": (result["ate"] / outcome_mean * 100) if outcome_mean else 0,
            })
        except Exception:
            continue

    insights.sort(key=lambda x: abs(x["effect_size_pct"]), reverse=True)
    return insights
