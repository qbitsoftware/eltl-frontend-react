import React, { useMemo } from "react";
import { Tournament } from "@/types/tournaments";
import { Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import SfumatoBackground from "@/components/sfumato/sfumatoBg";
import { useTranslation } from "react-i18next";
import {
  formatDateRange,
  useTournamentEvents,
  ProcessedEvent,
  getAbbreviatedMonth,
} from "../voistlused/-components/calendar-utils";
import { Skeleton } from "@/components/ui/skeleton";

interface Props {
  tournaments: Tournament[];
  isEmpty: boolean;
  isLoading?: boolean;
}

const CalendarWidget = ({ tournaments, isEmpty, isLoading = false }: Props) => {
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const events = useTournamentEvents(tournaments, queryClient);

  const { upcomingEvents, pastEvents } = useMemo(() => {
    if (isLoading || !events.length) {
      return { upcomingEvents: [], pastEvents: [] };
    }

    const now = new Date();
    const upcoming = events
      .filter((event) => new Date(event.end_date) >= now)
      .sort(
        (a, b) =>
          new Date(a.start_date).getTime() - new Date(b.start_date).getTime(),
      )
      .slice(0, 3);

    const past = events
      .filter((event) => new Date(event.end_date) < now)
      .sort(
        (a, b) =>
          new Date(b.start_date).getTime() - new Date(a.start_date).getTime(),
      )
      .slice(0, 3);

    return { upcomingEvents: upcoming, pastEvents: past };
  }, [events]);

  const EventCard = ({
    event,
    isUpcoming,
  }: {
    event: ProcessedEvent;
    isUpcoming: boolean;
  }) => {
    const linkPath = event.isGameday
      ? `/voistlused/${event.parentTournamentId}`
      : `/voistlused/${event.id}`;

    return (
      <Link to={linkPath} key={event.id}>
        <div className="mb-3 relative flex flex-col rounded-md h-[80px]">
          {isUpcoming ? (
            <SfumatoBackground>
              <div className="flex flex-row justify-between hover:bg-white/10 bg-white/30 items-center gap-2 p-3 h-full">
                <div className="flex-1 min-w-0 pr-2">
                  <h6 className="font-semibold truncate" title={event.name}>
                    {event.name}
                  </h6>
                  <p className="text-sm text-gray-600 truncate">
                    {event.category}
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  <div className="px-2 py-1 bg-white text-center font-bold border-t-2 border-red-600 rounded-t-[2px] text-stone-800 shadow-sm">
                    <div className="text-xs text-center font-medium">
                      {getAbbreviatedMonth(event.start_date)}
                    </div>
                    <div className="text-sm">
                      {
                        formatDateRange(event.start_date, event.end_date).split(
                          " - ",
                        )[0]
                      }
                    </div>
                  </div>
                  {event.end_date !== event.start_date && (
                    <>
                      <span className="font-semibold">-</span>
                      <div className="px-2 py-1 bg-white text-center font-bold border-t-2 border-red-600 rounded-t-[2px] text-stone-800 shadow-sm">
                        <div className="text-xs text-center font-medium">
                          {event.end_date !== event.start_date &&
                          new Date(event.start_date).getMonth() !==
                            new Date(event.end_date).getMonth()
                            ? getAbbreviatedMonth(event.end_date)
                            : getAbbreviatedMonth(event.start_date)}
                        </div>
                        <div className="text-sm">
                          {
                            formatDateRange(
                              event.start_date,
                              event.end_date,
                            ).split(" - ")[1]
                          }
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </SfumatoBackground>
          ) : (
            <div className="flex flex-row justify-between bg-gray-200/40 hover:bg-gray-100 rounded-md items-center gap-2 p-3 h-full">
              <div className="flex-1 min-w-0 pr-2">
                <h6 className="font-semibold truncate" title={event.name}>
                  {event.name}
                </h6>
                {event.isGameday && event.order ? (
                  <p className="text-sm text-gray-600">
                    {t("calendar.game_day")} {event.order}
                  </p>
                ) : (
                  <p className="text-sm text-gray-600 truncate">
                    {event.category}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <div className="px-2 py-1 bg-white text-center font-bold border-t border-red-600 rounded-t-[2px] text-stone-800 shadow-sm">
                  <div className="text-xs text-center font-medium">
                    {getAbbreviatedMonth(event.start_date)}
                  </div>
                  <div className="text-sm">
                    {
                      formatDateRange(event.start_date, event.end_date).split(
                        " - ",
                      )[0]
                    }
                  </div>
                </div>
                {event.end_date !== event.start_date && (
                  <>
                    <span className="font-semibold">-</span>
                    <div className="px-2 py-1 bg-white text-center font-bold border-t border-red-600 rounded-t-[2px] text-stone-800 shadow-sm">
                      <div className="text-xs text-center font-medium">
                        {event.end_date !== event.start_date &&
                        new Date(event.start_date).getMonth() !==
                          new Date(event.end_date).getMonth()
                          ? getAbbreviatedMonth(event.end_date)
                          : getAbbreviatedMonth(event.start_date)}
                      </div>
                      <div className="text-sm">
                        {
                          formatDateRange(
                            event.start_date,
                            event.end_date,
                          ).split(" - ")[1]
                        }
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </Link>
    );
  };

  const EventCardSkeleton = ({ isUpcoming }: { isUpcoming: boolean }) => (
    <div className="mb-3 relative flex flex-col shadow-eventCard rounded-md overflow-hidden h-[80px]">
      <div
        className={`flex flex-row justify-between items-center gap-2 p-3 h-full ${isUpcoming ? "bg-white/30" : "bg-gray-200/40"}`}
      >
        <div className="flex-1 min-w-0">
          <Skeleton className="h-5 w-4/5" />
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Skeleton className="h-12 w-12" />
          <Skeleton className="h-12 w-12" />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="grid md:grid-cols-2 gap-8 px-2">
        <div className="space-y-4">
          <h6 className="font-medium text-stone-800/80">
            {t("calendar.upcoming")}
          </h6>
          <div className="space-y-2">
            {[...Array(3)].map((_, index) => (
              <EventCardSkeleton
                key={`upcoming-skeleton-${index}`}
                isUpcoming={true}
              />
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <h6 className="font-medium text-stone-800/80">
            {t("calendar.finished")}
          </h6>
          <div className="space-y-2">
            {[...Array(3)].map((_, index) => (
              <EventCardSkeleton
                key={`past-skeleton-${index}`}
                isUpcoming={false}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && isEmpty) {
    return (
      <div className="border-2 border-dashed rounded-md py-12 px-8">
        <p className="pb-1 text-center font-medium text-stone-700">
          {t("calendar.no_tournaments")}
        </p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-8 px-2">
      <div className="space-y-4">
        <h6 className="font-medium text-stone-800/80">
          {t("calendar.upcoming")}
        </h6>

        <div className="space-y-2">
          {upcomingEvents.length > 0
            ? upcomingEvents.map((event) => (
                <EventCard key={event.id} event={event} isUpcoming={true} />
              ))
            : [1, 2, 3].map((_, index) => (
                <EventCardSkeleton key={`past-skeleton-${index}`} isUpcoming />
              ))}
        </div>
      </div>

      <div className="space-y-4">
        <h6 className="font-medium text-stone-800/80">
          {t("calendar.finished")}
        </h6>
        <div className="space-y-2">
          {pastEvents.length > 0
            ? pastEvents.map((event) => (
                <EventCard key={event.id} event={event} isUpcoming={false} />
              ))
            : [1, 2, 3].map((_, index) => (
                <EventCardSkeleton
                  key={`past-skeleton-${index}`}
                  isUpcoming={false}
                />
              ))}
        </div>
      </div>
    </div>
  );
};

export default React.memo(CalendarWidget);
