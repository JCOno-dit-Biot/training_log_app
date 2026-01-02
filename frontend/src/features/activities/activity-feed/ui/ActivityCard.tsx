import { useEffect, useMemo, useState } from 'react';
import React from 'react';
import { MessageCircle, MoreHorizontal, Send } from 'lucide-react';

import { useAuth } from '@app/auth/auth-context';
import { getRatingColor } from '@shared/util/GetRatingColor';
import {
  useActivityComments,
  useAddComment,
  useDeleteComment,
  useUpdateComment,
} from '@features/activities/activity-comment/model/useComments';
import { useDogs } from '@features/dogs/model/useDogs';
import { useRunners } from '@features/runners/model/useRunners';
import { useSports } from '@features/sports/model/useSports';
import type { Activity } from '@/entities/activities/model';
import { Badge } from '@/shared/ui/badge';
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/shared/ui/card"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/ui/dropdown-menu"
import { Input } from "@/shared/ui/input"
import { computeDuration } from "@/shared/util/computeDuration"
import { formatActivityDate } from '@/shared/util/FormatDate';
import { formatLocationLabel } from '@/shared/util/formatLocationLabel';

import { CommentItem } from '../../activity-comment/ui/CommentItem';

export default function ActivityCard({
  activity,
  onDelete,
  onSuccess,
  onEdit,
}: {
  activity: Activity;
  onDelete: (activity_id: number) => void;
  onSuccess?: () => void | Promise<void>;
  onEdit: (activity: Activity) => void;
}) {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [showLaps, setShowLaps] = useState(false);

  const [commentCount, setCommentCount] = useState<number>(activity.comment_count);

  const { user } = useAuth();

  const { data: comments = [], isLoading: loadingComments } = useActivityComments(
    activity.id,
    showComments,
  );
  const { mutate: addComment } = useAddComment();
  const { mutate: editComment } = useUpdateComment();
  const { mutate: removeComment } = useDeleteComment();

  // Comments are lazy loaded on render so we just need to set the visibility to true
  const handleToggleComments = () => setShowComments((v) => !v);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    addComment(
      { activityId: activity.id, username: user?.sub ?? null, text: newComment.trim() },
      { onSuccess: () => setNewComment('') },
    );
  };

  // sync comment count to activity
  useEffect(() => {
    setCommentCount(activity.comment_count ?? 0);
  }, [activity.comment_count]);

  //activity.dogs.dog.forEach(dog => console.log('Dog:', dog));

  const DEFAULT_AVATAR = 'https://www.gravatar.com/avatar/?d=mp';

  const { byId: sports } = useSports();
  const { byId: dogs } = useDogs();
  const { byId: runners } = useRunners();

  const date = formatActivityDate(activity.timestamp);

  const location = activity.location.name
    ? formatLocationLabel(activity.location.name)
    : "-"


  //const dogNames = activity.dogs.map((d) => d.name).join(', ');

  //const sport = [...sports.values()].find(s => s.name === activity.sport.name);
  const sport = useMemo(() => {
    const s = [...sports.values()].find((x) => x.name === activity.sport.name)
    return s ?? activity.sport
  }, [sports, activity.sport])

  const speedOrPace =
    sport.display_mode === 'pace'
      ? `${activity.pace} min/km`
      : `${activity.speed.toFixed(1)} km/h`;

  const duration =
    computeDuration({
      distanceKm: activity.distance,
      speedKmh: activity.speed,
      paceMinPerKm: activity.pace,
    }) ?? "—"

  const runnerImageUrl = runners.get(activity.runner.id)
    ? `/profile_picture/runners/${runners.get(activity.runner.id)?.image_url}`
    : DEFAULT_AVATAR;


  const dogElements = activity.dogs.map((dog) => {
    const cachedDog = dogs.get(dog.dog.id);
    const dogImageUrl = cachedDog ? `/profile_picture/dogs/${cachedDog.image_url}` : DEFAULT_AVATAR;
    return (
      <div key={dog.dog.id} className="flex items-center gap-5">
        <img
          src={dogImageUrl}
          alt={dog.dog.name}
          className="h-14 w-14 rounded-full border object-cover"
        />
        <div className='leading-tight'>
          <div className="text-neutral-900 text-lg font-semibold">{dog.dog.name}</div>
          <div className={`font-semibold ${getRatingColor(dog.rating)}`}>{dog.rating}</div>
        </div>
      </div>
    );
  });

  function formatWeather(weather: Activity["weather"]) {
    if (!weather) return null
    const { temperature, humidity, condition } = weather
    const tempText = temperature == null ? "—°C" : `${temperature}°C`
    const humidityText = humidity == null ? "—%" : `${Math.round(humidity * 100)}%`
    const conditionText = !condition ? "—" : condition
    return `${tempText} • ${humidityText} • ${conditionText}`
  }

  const weatherLine = formatWeather(activity.weather)
  return (
    <Card className="w-full">
      {/* Header: Sport + subtitle + menu */}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">

            <div className="mt-1 text-xs text-muted-foreground">
              <span className="whitespace-nowrap">{date}</span>
              <span className="px-1">•</span>
              <span className="truncate">{location}</span>
            </div>

            {weatherLine && (
              <div className="text-xs mt-1 text-muted-foreground">
                <span className="tracking-wide">Weather</span>:{" "}
                <span className="text-muted-foreground">{weatherLine}</span>
              </div>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-36">
              <DropdownMenuItem onClick={() => onEdit(activity)}>Edit</DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(activity.id)}
                className="text-destructive focus:text-destructive"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      {/* Body: participants left, metrics right */}
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_260px] pr-10">
        {/* Left: runner + dogs */}
        <div className="space-y-3">
          {/* Runner (image + text), centered as a group */}
          <div className="flex items-center justify-between gap-5 px-5">
            <div className="flex items-center gap-3">
              <img
                src={runnerImageUrl}
                alt={activity.runner.name}
                className="h-14 w-14 rounded-full border object-cover"
              />
              <div className="leading-tight">
                <div className="text-lg font-semibold text-neutral-900">{activity.runner.name}</div>
              </div>
            </div>
          </div>

          {/* Dogs */}
          <div className="px-5 flex flex-wrap gap-5">
            {dogElements}
          </div>
        </div>


        {/* Right: metrics column */}
        <div className="flex flex-col justify-center gap-3 px-5">

          <div className="flex items-baseline justify-between gap-5">
            <div className="text-sm uppercase tracking-wide text-muted-foreground">Sport</div>
            <div className="flex gap-2 text-lg font-semibold text-foreground tabular-nums">
              {sport?.name ?? activity.sport.name}
              {activity.workout && (
                <Badge
                  variant={showLaps ? "default" : "secondary"}
                  className="cursor-pointer select-none text-xs transition-colors"
                  title="Toggle laps"
                  onClick={() => setShowLaps((prev) => !prev)}
                >
                  Workout
                </Badge>
              )}

            </div>
          </div>
          <Metric label="Distance" value={`${activity.distance} km`} />
          <Metric label="Duration" value={duration} />
          <Metric label={sport?.display_mode === "pace" ? "Pace" : "Speed"} value={speedOrPace} />
        </div>
      </CardContent>

      {/* Laps */}
      {
        showLaps && activity.laps?.length > 0 && (
          <div className="px-6 pb-2">
            <div className="rounded-md border bg-secondary/20 px-4 py-3">
              <div className="grid grid-cols-3 gap-2 text-center text-sm">
                <div className="font-semibold text-primary">Lap</div>
                <div className="font-semibold text-primary">Distance</div>
                <div className="font-semibold text-primary">Time</div>

                {activity.laps.map((lap) => (
                  <React.Fragment key={lap.lap_number}>
                    <div>Lap {lap.lap_number + 1}</div>
                    <div>{lap.lap_distance} km</div>
                    <div>{lap.lap_time}</div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        )
      }
      {/* Footer: comments */}
      <CardFooter className="flex flex-col gap-1 pt-0">
        <div className="flex mx-6 border-t" />
        <div className="flex w-full items-center justify-end">
          <Button variant="ghost" size="sm" onClick={() => setShowComments((v) => !v)} className="gap-2">
            <MessageCircle className="h-4 w-4" />
            <span>{commentCount ?? 0}</span>
          </Button>
        </div>

        {showComments && (
          <div className="w-full space-y-2">
            {loadingComments ? (
              <div className="text-sm italic text-muted-foreground">Loading comments...</div>
            ) : comments.length > 0 ? (
              comments.map((c) => (
                <CommentItem
                  key={c.id}
                  activityId={activity.id}
                  comment={c}
                  currentUsername={user?.sub}
                  onReplace={(updated) =>
                    editComment({
                      activityId: activity.id,
                      id: updated.id,
                      text: updated.comment,
                      username: user?.username ?? null,
                    })
                  }
                  onRemove={(id) => removeComment({ activityId: activity.id, id })}
                  onError={(msg) => console.error(msg)}
                />
              ))
            ) : (
              <div className="text-sm italic text-muted-foreground">No comments yet.</div>
            )}

            <div className="relative">
              <Input
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                className="pr-10 bg-background"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && newComment.trim()) {
                    e.preventDefault()
                    handleAddComment()
                  }
                }}
              />
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute right-1 top-1/2 h-8 w-8 -translate-y-1/2"
                onClick={handleAddComment}
                disabled={!newComment.trim()}
                aria-label="Send comment"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardFooter>
    </Card >
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-5">
      <div className="text-sm uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="text-lg font-semibold text-foreground tabular-nums">{value}</div>
    </div>
  )
}