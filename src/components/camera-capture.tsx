"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Camera, Upload, SwitchCamera, X } from "lucide-react";
import { useT } from "@/i18n/language-provider";
import { Button } from "./ui";

const MAX_WIDTH = 1024;

/** Draw an image/video source onto a canvas, scaled down, and return a JPEG data URL. */
function toScaledJpeg(
  source: HTMLVideoElement | HTMLImageElement,
  w: number,
  h: number,
): string {
  const scale = Math.min(1, MAX_WIDTH / w);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(w * scale);
  canvas.height = Math.round(h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.85);
}

export function CameraCapture({
  onImage,
}: {
  onImage: (dataUrl: string) => void;
}) {
  const t = useT();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [active, setActive] = useState(false);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [error, setError] = useState<string | null>(null);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((tr) => tr.stop());
    streamRef.current = null;
    setActive(false);
  }, []);

  const start = useCallback(
    async (mode: "environment" | "user") => {
      setError(null);
      try {
        streamRef.current?.getTracks().forEach((tr) => tr.stop());
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode } },
          audio: false,
        });
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }
        setActive(true);
      } catch {
        setError(t("scan.cameraError"));
        setActive(false);
      }
    },
    [t],
  );

  useEffect(() => stop, [stop]);

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const url = toScaledJpeg(
      video,
      video.videoWidth,
      video.videoHeight,
    );
    stop();
    if (url) onImage(url);
  };

  const flip = () => {
    const next = facing === "environment" ? "user" : "environment";
    setFacing(next);
    void start(next);
  };

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const img = new Image();
    img.onload = () => {
      const url = toScaledJpeg(img, img.naturalWidth, img.naturalHeight);
      URL.revokeObjectURL(img.src);
      if (url) onImage(url);
    };
    img.src = URL.createObjectURL(file);
    e.target.value = "";
  };

  return (
    <div>
      {active ? (
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] border border-border bg-black">
          {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
          <video
            ref={videoRef}
            playsInline
            muted
            className="aspect-[3/4] w-full object-cover"
          />
          <button
            type="button"
            onClick={stop}
            className="absolute right-3 top-3 grid size-9 place-items-center rounded-full bg-black/50 text-white"
            aria-label={t("common.close")}
          >
            <X className="size-5" />
          </button>
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-6 bg-gradient-to-t from-black/60 to-transparent p-4">
            <button
              type="button"
              onClick={flip}
              className="grid size-11 place-items-center rounded-full bg-white/15 text-white backdrop-blur"
              aria-label={t("scan.switchCamera")}
            >
              <SwitchCamera className="size-5" />
            </button>
            <button
              type="button"
              onClick={capture}
              aria-label={t("scan.capture")}
              className="grid size-16 place-items-center rounded-full border-4 border-white bg-white/30 text-white"
            >
              <span className="size-11 rounded-full bg-white" />
            </button>
            <span className="size-11" />
          </div>
        </div>
      ) : (
        <div className="rounded-[var(--radius-lg)] border border-dashed border-border bg-card p-6 text-center">
          <span className="mx-auto grid size-16 place-items-center rounded-full bg-primary/12 text-primary">
            <Camera className="size-8" />
          </span>
          <p className="mt-3 text-sm text-muted-foreground">
            {t("scan.intro")}
          </p>
          {error ? (
            <p className="mt-2 text-sm text-danger">{error}</p>
          ) : null}
          <div className="mt-4 flex flex-col gap-2">
            <Button size="lg" onClick={() => start(facing)}>
              <Camera className="size-5" />
              {t("scan.openCamera")}
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => fileRef.current?.click()}
            >
              <Upload className="size-5" />
              {t("scan.upload")}
            </Button>
          </div>
        </div>
      )}
      {/* No `capture` attribute: this opens the gallery / file picker.
          Live camera is handled separately via getUserMedia above. */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        onChange={onFile}
        className="hidden"
      />
    </div>
  );
}
