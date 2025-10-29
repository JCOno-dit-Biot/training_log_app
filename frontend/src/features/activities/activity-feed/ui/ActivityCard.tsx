import { useEffect, useState } from 'react';
import React from 'react';
import { MessageCircle, MoreHorizontal, Rocket, Send } from 'lucide-react';

import { useAuth } from '@app/providers/auth-provider';
import { getRatingColor } from '@shared/util/GetRatingColor';
import type { Activity } from '@entities/activities/model';
import {
  useActivityComments,
  useAddComment,
  useDeleteComment,
  useUpdateComment,
} from '@features/activities/activity-comment/model/useComments';
import { useDogs } from '@features/dogs/model/useDogs';
import { useRunners } from '@features/runners/model/useRunners';
import { useSports } from '@features/sports/model/useSports';
import { formatActivityDate } from '@/shared/util/FormatDate';

import { CommentItem } from '../../activity-comment/ui/CommentItem';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';

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
  const capitalizedLocation =
    activity.location.name.charAt(0).toUpperCase() + activity.location.name.slice(1);

  //const dogNames = activity.dogs.map((d) => d.name).join(', ');

  //const sport = [...sports.values()].find(s => s.name === activity.sport.name);
  activity.sport = [...sports.values()].find((s) => s.name === activity.sport.name); // update the sport in activity to populate all fields, not just name
  const speedOrPace =
    activity.sport?.display_mode === 'pace'
      ? `${activity.pace} min/km`
      : `${activity.speed.toFixed(1)} km/h`;
  const runnerImageUrl = runners.get(activity.runner.id)
    ? `/profile_picture/runners/${runners.get(activity.runner.id)?.image_url}`
    : DEFAULT_AVATAR;

  const dogElements = activity.dogs.map((dog) => {
    const cachedDog = dogs.get(dog.dog.id);
    const dogImageUrl = cachedDog ? `/profile_picture/dogs/${cachedDog.image_url}` : DEFAULT_AVATAR;
    return (
      <div key={dog.dog.id} className="flex items-center gap-2">
        <img
          src={dogImageUrl}
          alt={dog.dog.name}
          className="h-14 w-14 rounded-full border object-cover"
        />
        <div>
          <div className="text-charcoal text-left text-base font-semibold">{dog.dog.name}</div>
          <div className={`font-semibold ${getRatingColor(dog.rating)}`}>{dog.rating}</div>
        </div>
      </div>
    );
  });

  return (
    <div className="border-stone flex flex-col gap-1 rounded-2xl border bg-white p-4 shadow-md">
      {/* Top-right: Edit/Delete menu */}
      <Menu as="div" className="relative ml-auto">
        <MenuButton
          className="rounded-2xl p-1 hover:bg-stone-100 focus:ring-2 focus:ring-stone-300 focus:outline-none"
          aria-label="Activity options"
        >
          <MoreHorizontal className="h-6 w-6 text-stone-600" />
        </MenuButton>

        {/* anchor keeps the panel attached to the trigger regardless of sidebars/overflow */}
        <MenuItems
          anchor="bottom end"
          className="z-50 mt-1 w-36 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black/5 focus:outline-none"
        >
          <div className="py-1">
            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => onEdit(activity)}
                  className={`${active ? 'bg-gray-100' : 'bg-white'} text-charcoal w-full px-4 py-2 text-left text-sm`}
                >
                  Edit
                </button>
              )}
            </MenuItem>

            <MenuItem>
              {({ active }) => (
                <button
                  onClick={() => onDelete(activity.id)}
                  className={`${active ? 'bg-gray-100' : 'bg-white'} w-full px-4 py-2 text-left text-sm text-red-600`}
                >
                  Delete
                </button>
              )}
            </MenuItem>
          </div>
        </MenuItems>
      </Menu>
      {/* Runner + Dogs + Weather */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Runner */}
        <div className="flex items-center gap-3">
          <img
            src={runnerImageUrl}
            alt={activity.runner.name}
            className="h-14 w-14 rounded-full border object-cover"
          />
          <div>
            <div className="text-charcoal text-left font-semibold">{activity.runner.name}</div>
            <div className="text-stone text-xs whitespace-nowrap">{date}</div>
            <div className="text-stone text-left text-xs whitespace-nowrap">
              {capitalizedLocation}
            </div>
          </div>
        </div>

        {/* Dogs */}
        <div className={`flex gap-8 ${activity.dogs.length === 1 ? 'mx-auto' : ''}`}>
          {dogElements}
        </div>

        {/* Weather */}
        <div className="min-w-[140px] text-right">
          <div className="text-stone text-xs tracking-wide uppercase">Weather</div>
          <div>
            {activity.weather.temperature}°C, {activity.weather.humidity * 100}%,{' '}
            {activity.weather.condition}
          </div>
        </div>
      </div>

      {/* Sport / Distance / Pace */}
      <div className="mt-6 flex w-full justify-around gap-4 text-center">
        <div>
          <div className="text-stone text-xs tracking-wide uppercase">Sport</div>
          <div className="text-charcoal flex items-center gap-2 text-xl font-bold">
            {activity.sport.name}
            {activity.workout && (
              <button
                onClick={() => setShowLaps((prev) => !prev)}
                className="group"
                title="Toggle Laps"
              >
                <Rocket
                  className={`text-primary group-hover:text-accent h-5 w-5 cursor-pointer transition-transform duration-150 group-hover:scale-110 ${
                    showLaps ? 'rotate-12' : ''
                  }`}
                />
              </button>
            )}
          </div>
        </div>
        <div>
          <div className="text-stone text-xs tracking-wide uppercase">Distance</div>
          <div className="text-charcoal text-xl font-bold">{activity.distance} km</div>
        </div>
        <div>
          <div className="text-stone text-xs tracking-wide uppercase">
            {activity.sport?.display_mode === 'pace' ? 'Pace' : 'Speed'}
          </div>
          <div className="text-charcoal text-xl font-bold">{speedOrPace}</div>
        </div>
      </div>
      {showLaps && activity.laps.length > 0 && (
        <div className="bg-secondary border-primary mt-3 rounded-md border px-4 py-2">
          <div className="text-charcoal grid grid-cols-3 gap-2 text-center text-sm">
            <div className="text-primary font-bold">Lap</div>
            <div className="text-primary font-bold">Distance</div>
            <div className="text-primary font-bold">Time</div>

            {activity.laps.map((lap) => (
              <React.Fragment key={lap.lap_number}>
                <div>Lap {lap.lap_number + 1}</div>
                <div>{lap.lap_distance} km</div>
                <div>{lap.lap_time}</div>
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Comment bottom right */}
      {commentCount !== undefined && (
        <div
          onClick={handleToggleComments}
          className="text-charcoal flex cursor-pointer items-center justify-end gap-1"
        >
          <MessageCircle className="hover:text-primary h-4 w-4 transition-transform duration-150 hover:scale-110" />
          <span>{commentCount}</span>
        </div>
      )}
      {showComments && (
        <div className="text-charcoal mt-2 space-y-2 border-t px-4 pt-2 text-sm">
          {loadingComments ? (
            <div className="text-stone italic">Loading comments...</div>
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
            <div className="text-stone italic">No comments yet.</div>
          )}

          <div className="mt-2 flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Add a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newComment.trim()) {
                    e.preventDefault(); // stop form submit or newline
                    handleAddComment();
                  }
                }}
                className="w-full rounded bg-gray-200 px-2 py-1 pr-8 text-sm"
              />
              <button
                onClick={handleAddComment}
                className="text-primary absolute top-1/2 right-2 -translate-y-1/2 bg-gray-200 hover:text-gray-800 disabled:text-gray-400"
                disabled={!newComment.trim()}
                aria-label="Send comment"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
