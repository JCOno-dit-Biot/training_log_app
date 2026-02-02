
import type { Runner } from '@entities/runners/model';
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"

interface RunnerCardProps {
  runner: Runner;
}

export default function RunnerCard({ runner }: RunnerCardProps) {
  const DEFAULT_AVATAR = 'https://img.icons8.com/ios-filled/100/cccccc/user-male-circle.png';

  const avatarSrc = runner.image_url
    ? `/profile_picture/runners/${runner.image_url}`
    : DEFAULT_AVATAR

  return (
    <Card className="relative min-h-40 w-full ">
      <CardHeader className="pb-2">
        <CardTitle className="text-base font-bold">
          {runner.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Reserved for future stats / metadata */}
      </CardContent>

      <img
        src={avatarSrc}
        alt={runner.name}
        className="
          absolute right-4 top-4
          h-25 w-25
          rounded-full
          border
          object-cover
          bg-muted
        "
      />
    </Card>
  )
}