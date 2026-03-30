import { useState } from 'react';
import { Pencil } from 'lucide-react';

import type { Runner } from '@entities/runners/model';
import { Button } from "@/shared/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/shared/ui/card"

import EditRunnerModal from './EditRunnerModal';
interface RunnerCardProps {
  runner: Runner;
}

export default function RunnerCard({ runner }: RunnerCardProps) {
  const DEFAULT_AVATAR = 'https://img.icons8.com/ios-filled/100/cccccc/user-male-circle.png';

  const avatarSrc = runner.image_url
    ? runner.image_url
    : DEFAULT_AVATAR

  const [open, setOpen] = useState(false);
  return (
    <>
      <Card className="relative min-h-40 w-full ">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base font-bold">
                  {runner.name}
                </CardTitle>

                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setOpen(true)}
                  aria-label={`Edit ${runner.name}`}
                  className="h-5 w-5 p-0 mb-1 text-muted-foreground hover:text-foreground"
                >
                  <Pencil className="h-1 w-1" />
                </Button>
              </div>
            </div>
          </div>

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

      <EditRunnerModal runner={runner} open={open} onOpenChange={setOpen} />
    </>
  )
}