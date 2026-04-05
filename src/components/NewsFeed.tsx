"use client";

import { useFormatter, useTranslations } from "next-intl";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { isDirectVideoUrl, parseYoutubeVideoId } from "@/lib/news-video";
import { CommentThread } from "./CommentThread";
import { ShareNewsPost } from "./ShareNewsPost";
import { useSession } from "./SessionProvider";
import { FilePickerInput } from "./FilePickerInput";
import { ReportNewsVideo } from "./ReportNewsVideo";

type Post = {
  id: string;
  title: string;
  body: string;
  imagesJson: string;
  videoUrl: string | null;
  createdAt: string;
  user: { id: string; name: string | null; email: string };
};

function parseImages(json: string): string[] {
  try {
    const a = JSON.parse(json || "[]") as unknown;
    return Array.isArray(a) ? a.filter((x) => typeof x === "string") : [];
  } catch {
    return [];
  }
}

function NewsVideoBlock({ url }: { url: string }) {
  const yt = parseYoutubeVideoId(url);
  if (yt) {
    return (
      <div className="relative mt-4 aspect-video w-full max-w-2xl overflow-hidden rounded-lg bg-black">
        <iframe
          title="YouTube"
          src={`https://www.youtube-nocookie.com/embed/${yt}`}
          className="absolute inset-0 h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }
  if (isDirectVideoUrl(url)) {
    return (
      <video
        className="mt-4 max-h-[480px] w-full max-w-2xl rounded-lg bg-black"
        controls
        playsInline
        src={url}
      />
    );
  }
  return (
    <p className="mt-3 text-sm text-zone-muted">
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-archi-400 underline hover:text-archi-300"
      >
        {url}
      </a>
    </p>
  );
}

export function NewsFeed() {
  const t = useTranslations("news");
  const tCommon = useTranslations("common");
  const format = useFormatter();
  const { user } = useSession();
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [postError, setPostError] = useState<string | null>(null);
  const [fileInputKey, setFileInputKey] = useState(0);

  const load = useCallback(async () => {
    const r = await fetch("/api/news");
    const j = await r.json();
    setPosts(j.posts ?? []);
  }, []);

  useEffect(() => {
    load().finally(() => setLoading(false));
  }, [load]);

  useEffect(() => {
    if (typeof window === "undefined" || loading) return;
    const h = window.location.hash;
    if (h.startsWith("#post-")) {
      const id = h.slice(1);
      requestAnimationFrame(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [loading, posts]);

  async function onImageFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files?.length) return;
    const arr = Array.from(files).slice(0, 6);
    const results = await Promise.all(
      arr.map(
        (f) =>
          new Promise<string>((resolve, reject) => {
            const r = new FileReader();
            r.onload = () => resolve(r.result as string);
            r.onerror = reject;
            r.readAsDataURL(f);
          }),
      ),
    );
    setImages(results);
  }

  async function publish(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;
    const v = videoUrl.trim();
    const r = await fetch("/api/news", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        title,
        body,
        images,
        videoUrl: v === "" ? undefined : v,
      }),
    });
    if (r.ok) {
      setPostError(null);
      setTitle("");
      setBody("");
      setImages([]);
      setVideoUrl("");
      setFileInputKey((k) => k + 1);
      load();
    } else if (r.status === 422) {
      const j = (await r.json()) as { code?: string };
      setPostError(
        j.code === "moderation" ? tCommon("moderationBlocked") : null,
      );
    } else {
      setPostError(null);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="font-display text-xl font-semibold leading-snug tracking-normal text-archi-100 sm:text-2xl">
        {t("title")}
      </h1>

      {user && (
        <form onSubmit={publish} className="pda-panel p-6">
          <h2 className="mb-4 text-lg font-semibold">{t("newPost")}</h2>
          {postError ? (
            <p className="mb-3 text-sm text-red-400/90" role="alert">
              {postError}
            </p>
          ) : null}
          <label className="block">
            <span className="text-sm text-zone-muted">{t("postTitle")}</span>
            <input
              className="mt-1 w-full pda-input"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                setPostError(null);
              }}
              required
            />
          </label>
          <label className="mt-3 block">
            <span className="text-sm text-zone-muted">{t("postBody")}</span>
            <textarea
              className="mt-1 w-full pda-input"
              rows={5}
              value={body}
              onChange={(e) => {
                setBody(e.target.value);
                setPostError(null);
              }}
              required
            />
          </label>
          <label className="mt-3 block">
            <span className="text-sm text-zone-muted">{t("photos")}</span>
            <FilePickerInput
              key={fileInputKey}
              accept="image/*"
              multiple
              onChange={(e) => void onImageFiles(e)}
            />
          </label>
          {images.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {images.map((src, i) => (
                <div
                  key={i}
                  className="relative h-20 w-20 overflow-hidden rounded-md bg-zone-deep"
                >
                  <Image src={src} alt="" fill className="object-cover" unoptimized />
                </div>
              ))}
            </div>
          )}
          <label className="mt-3 block">
            <span className="text-sm text-zone-muted">{t("videoUrlLabel")}</span>
            <input
              type="url"
              className="mt-1 w-full pda-input"
              value={videoUrl}
              onChange={(e) => {
                setVideoUrl(e.target.value);
                setPostError(null);
              }}
              placeholder="https://..."
            />
            <span className="mt-1 block text-xs text-zone-muted">{t("videoUrlHint")}</span>
          </label>
          <button
            type="submit"
            className="mt-4 rounded-lg bg-archi-600 px-6 py-2 font-medium text-black hover:bg-archi-500"
          >
            {t("publish")}
          </button>
        </form>
      )}

      {loading ? (
        <p className="text-zone-muted">…</p>
      ) : (
        <ul className="space-y-8">
          {posts.map((post) => {
            const imgs = parseImages(post.imagesJson);
            return (
              <li key={post.id} id={`post-${post.id}`} className="pda-card scroll-mt-24">
                <div className="p-6">
                  <h3 className="text-xl font-semibold text-zone-fog">{post.title}</h3>
                  <p className="mt-1 text-sm text-zone-muted">
                    {post.user.name || post.user.email} ·{" "}
                    {format.dateTime(new Date(post.createdAt), {
                      dateStyle: "short",
                      timeStyle: "short",
                    })}
                  </p>
                  <p className="mt-4 whitespace-pre-wrap text-zone-fog/95">{post.body}</p>
                  {imgs.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {imgs.map((src, i) => (
                        <div
                          key={i}
                          className="relative h-40 w-40 overflow-hidden rounded-lg bg-zone-deep sm:h-48 sm:w-48"
                        >
                          <Image
                            src={src}
                            alt=""
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  {post.videoUrl ? (
                    <>
                      <NewsVideoBlock url={post.videoUrl} />
                      <ReportNewsVideo postId={post.id} authorUserId={post.user.id} />
                    </>
                  ) : null}
                  <ShareNewsPost
                    postId={post.id}
                    title={post.title}
                    bodyExcerpt={post.body.slice(0, 200)}
                  />
                </div>
                <CommentThread targetType="news" targetId={post.id} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
