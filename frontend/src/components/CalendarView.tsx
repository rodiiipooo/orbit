"use client";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { PLATFORM_COLORS } from "@/lib/utils";

interface Props {
  posts: any[];
}

export default function CalendarView({ posts }: Props) {
  const events = posts
    .filter(p => p.scheduled_at)
    .map(p => ({
      id: String(p.id),
      title: p.body.slice(0, 40) + (p.body.length > 40 ? "…" : ""),
      start: p.scheduled_at,
      backgroundColor: PLATFORM_COLORS[p.platforms?.[0]] || "#5c6bff",
      borderColor: "transparent",
      extendedProps: { status: p.status, platforms: p.platforms },
    }));

  return (
    <FullCalendar
      plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
      initialView="dayGridMonth"
      headerToolbar={{
        left: "prev,next today",
        center: "title",
        right: "dayGridMonth,timeGridWeek",
      }}
      events={events}
      height={480}
      eventClassNames="text-xs font-medium rounded cursor-pointer"
    />
  );
}
