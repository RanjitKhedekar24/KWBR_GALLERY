import React, { useState, useEffect, useRef } from "react";
import {
  FaHotel,
  FaTimes,
  FaShareAlt,
  FaDownload,
  FaArrowLeft,
  FaArrowRight,
  FaHeart,
  FaRegHeart,
  FaExpand,
  FaCompress,
  FaPlay,
  FaPause,
  FaVolumeUp,
  FaVolumeMute,
  FaVideo,
} from "react-icons/fa";
import { assets } from "./assets/assets.js";

const HotelGallery = () => {
  // Combine images and videos from assets
  const [media] = useState(() => {
    const mediaArray = [];
    let id = 1;

    // Process all assets - images will be detected by extension, videos need to be specified
    Object.keys(assets).forEach((key) => {
      const url = assets[key];

      // Check if it's a video by file extension or specific key naming
      const isVideo =
        typeof url === "string" &&
        (url.match(/\.(mp4|webm|ogg|mov|avi)$/i) ||
          key.toLowerCase().includes("video"));

      mediaArray.push({
        id: id++,
        url: url,
        type: isVideo ? "video" : "image",
        name: key,
      });
    });

    return mediaArray;
  });

  const [selectedMedia, setSelectedMedia] = useState(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [likedMedia, setLikedMedia] = useState(new Set());
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const viewerRef = useRef(null);
  const videoRef = useRef(null);

  const openMediaViewer = (media, index) => {
    setSelectedMedia(media);
    setCurrentIndex(index);
    setIsViewerOpen(true);
    setIsPlaying(media.type === "video");
  };

  const closeMediaViewer = () => {
    if (videoRef.current) {
      videoRef.current.pause();
    }
    setIsViewerOpen(false);
    setSelectedMedia(null);
    setIsFullscreen(false);
    setIsPlaying(false);
  };

  const nextMedia = () => {
    const nextIndex = (currentIndex + 1) % media.length;
    setCurrentIndex(nextIndex);
    setSelectedMedia(media[nextIndex]);
    setIsPlaying(media[nextIndex].type === "video");
  };

  const prevMedia = () => {
    const prevIndex = (currentIndex - 1 + media.length) % media.length;
    setCurrentIndex(prevIndex);
    setSelectedMedia(media[prevIndex]);
    setIsPlaying(media[prevIndex].type === "video");
  };

  const toggleLike = (mediaId) => {
    const newLikedMedia = new Set(likedMedia);
    if (newLikedMedia.has(mediaId)) newLikedMedia.delete(mediaId);
    else newLikedMedia.add(mediaId);
    setLikedMedia(newLikedMedia);
  };

  const downloadMedia = async (mediaUrl, mediaName, mediaType) => {
    try {
      const response = await fetch(mediaUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `hotel-${mediaType}-${mediaName}.${
        mediaType === "video" ? "mp4" : "jpg"
      }`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Download failed:", error);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      if (viewerRef.current.requestFullscreen) {
        viewerRef.current.requestFullscreen();
      } else if (viewerRef.current.webkitRequestFullscreen) {
        viewerRef.current.webkitRequestFullscreen();
      } else if (viewerRef.current.msRequestFullscreen) {
        viewerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  const togglePlayPause = () => {
    if (selectedMedia?.type === "video" && videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = () => {
    if (selectedMedia?.type === "video" && videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (videoRef.current) {
      videoRef.current.volume = newVolume;
    }
  };

  const handleVideoEnd = () => {
    setIsPlaying(false);
  };

  const handleVideoPlay = () => {
    setIsPlaying(true);
  };

  const handleVideoPause = () => {
    setIsPlaying(false);
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    document.addEventListener("webkitfullscreenchange", handleFullscreenChange);
    document.addEventListener("msfullscreenchange", handleFullscreenChange);

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
      document.removeEventListener(
        "webkitfullscreenchange",
        handleFullscreenChange
      );
      document.removeEventListener(
        "msfullscreenchange",
        handleFullscreenChange
      );
    };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isViewerOpen) return;
      if (e.key === "ArrowLeft") prevMedia();
      else if (e.key === "ArrowRight") nextMedia();
      else if (e.key === "Escape") {
        if (isFullscreen) {
          toggleFullscreen();
        } else {
          closeMediaViewer();
        }
      } else if (e.key === "f" || e.key === "F") {
        toggleFullscreen();
      } else if (e.key === " " && selectedMedia?.type === "video") {
        e.preventDefault();
        togglePlayPause();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isViewerOpen, currentIndex, isFullscreen, selectedMedia, isPlaying]);

  // Count media types for the header
  const imageCount = media.filter((item) => item.type === "image").length;
  const videoCount = media.filter((item) => item.type === "video").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-indigo-100 py-10 relative overflow-hidden">
      {/* Animated Background Glow */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-200 opacity-40 blur-3xl rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-300 opacity-30 blur-3xl animate-pulse delay-300"></div>
      </div>

      {/* Header */}
      <div className="container mx-auto px-4 text-center mb-16">
        <div className="flex flex-col items-center justify-center mb-6">
          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-400 to-purple-500 opacity-40 blur-lg rounded-full"></div>
            <FaHotel className="relative text-5xl text-blue-700 drop-shadow-lg" />
          </div>
          <h1 className="mt-4 text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent tracking-tight">
            Khotaci Wadi Beach Resort
          </h1>
          <p className="text-gray-600 mt-3 text-lg max-w-2xl mx-auto">
            Experience coastal elegance and serene luxury at our beachfront
            paradise.
          </p>
          <div className="mt-4 flex justify-center items-center space-x-4 text-gray-500 text-sm">
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
              <span>{imageCount} Photos</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-2">
              <FaVideo className="text-blue-400" />
              <span>{videoCount} Videos</span>
            </div>
            <span>•</span>
            <div className="flex items-center space-x-2">
              <FaHeart className="text-red-400" />
              <span>{likedMedia.size} Liked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Media Gallery */}
      <div className="container mx-auto px-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {media.map((item, index) => (
          <div
            key={item.id}
            className="group relative bg-white rounded-2xl shadow-xl overflow-hidden cursor-pointer transform transition duration-500 hover:-translate-y-2 hover:shadow-2xl"
            onClick={() => openMediaViewer(item, index)}
          >
            {item.type === "image" ? (
              <img
                src={item.url}
                alt={`Hotel ${item.name}`}
                className="w-full h-64 object-cover transition-transform duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="relative w-full h-64 bg-gray-900">
                <video
                  src={item.url}
                  className="w-full h-full object-cover opacity-90"
                  muted
                  loop
                  playsInline
                  preload="metadata"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-black/50 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <FaPlay className="text-white text-xl ml-1" />
                  </div>
                </div>
                <div className="absolute top-3 right-3 bg-black/60 text-white px-2 py-1 rounded-full text-xs flex items-center space-x-1">
                  <FaVideo className="text-blue-300" />
                  <span>Video</span>
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4">
              <div className="flex justify-between items-center text-white">
                <span className="text-sm font-medium">
                  {item.type === "image" ? "Image" : "Video"} #{item.id}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleLike(item.id);
                  }}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/40 transition"
                >
                  {likedMedia.has(item.id) ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Media Viewer */}
      {isViewerOpen && selectedMedia && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div
            ref={viewerRef}
            className={`relative ${
              isFullscreen ? "w-full h-full" : "max-w-5xl w-full max-h-[90vh]"
            } rounded-2xl overflow-hidden shadow-2xl transition-all duration-300 bg-black`}
          >
            {/* Close Button */}
            <button
              onClick={closeMediaViewer}
              className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition backdrop-blur-sm"
            >
              <FaTimes className="text-lg" />
            </button>

            {/* Navigation Arrows */}
            <button
              onClick={prevMedia}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-4 rounded-full transition backdrop-blur-sm"
            >
              <FaArrowLeft />
            </button>

            <button
              onClick={nextMedia}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 bg-black/60 hover:bg-black/80 text-white p-4 rounded-full transition backdrop-blur-sm"
            >
              <FaArrowRight />
            </button>

            {/* Fullscreen Toggle Button */}
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-16 z-10 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition backdrop-blur-sm"
              title={
                isFullscreen ? "Exit Fullscreen (F)" : "Enter Fullscreen (F)"
              }
            >
              {isFullscreen ? (
                <FaCompress className="text-lg" />
              ) : (
                <FaExpand className="text-lg" />
              )}
            </button>

            {/* Media Content */}
            {selectedMedia.type === "image" ? (
              <img
                src={selectedMedia.url}
                alt="Hotel"
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="relative w-full h-full flex items-center justify-center">
                <video
                  ref={videoRef}
                  src={selectedMedia.url}
                  className="w-full h-full object-contain"
                  controls={false}
                  onEnded={handleVideoEnd}
                  onPlay={handleVideoPlay}
                  onPause={handleVideoPause}
                  autoPlay
                  muted={isMuted || true} // 🔇 always starts muted
                  playsInline
                />

                {/* Video Controls Overlay */}
                <div className="absolute bottom-20 left-1/2 -translate-x-1/2 flex items-center space-x-4 bg-black/60 rounded-full px-6 py-3 backdrop-blur-sm">
                  <button
                    onClick={togglePlayPause}
                    className="text-white hover:text-blue-300 transition"
                  >
                    {isPlaying ? (
                      <FaPause className="text-xl" />
                    ) : (
                      <FaPlay className="text-xl" />
                    )}
                  </button>

                  <button
                    onClick={toggleMute}
                    className="text-white hover:text-blue-300 transition"
                  >
                    {isMuted ? (
                      <FaVolumeMute className="text-xl" />
                    ) : (
                      <FaVolumeUp className="text-xl" />
                    )}
                  </button>

                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.1"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 accent-blue-500"
                  />

                  <div className="text-white text-sm flex items-center space-x-1">
                    <FaVideo className="text-blue-300" />
                    <span>Video</span>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Bar */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-5 flex justify-between items-center text-white">
              <div className="text-sm">
                <h3 className="font-semibold">Khotaci Wadi Beach Resort</h3>
                <p className="opacity-75">
                  {currentIndex + 1} / {media.length} •{" "}
                  {selectedMedia.type === "image" ? "Photo" : "Video"}
                  {isFullscreen && " • Fullscreen (Press F to toggle)"}
                  {selectedMedia.type === "video" && " • Space to play/pause"}
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => toggleLike(selectedMedia.id)}
                  className="flex items-center space-x-1 hover:text-red-400 transition"
                >
                  {likedMedia.has(selectedMedia.id) ? (
                    <FaHeart className="text-red-500" />
                  ) : (
                    <FaRegHeart />
                  )}
                  <span>Like</span>
                </button>

                <button
                  onClick={() =>
                    downloadMedia(
                      selectedMedia.url,
                      selectedMedia.id,
                      selectedMedia.type
                    )
                  }
                  className="flex items-center space-x-1 hover:text-blue-300 transition"
                >
                  <FaDownload />
                  <span>Download</span>
                </button>

                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: "Khotaci Wadi Beach Resort",
                        text: `Check out this beautiful resort ${selectedMedia.type}!`,
                        url: selectedMedia.url,
                      });
                    } else {
                      navigator.clipboard.writeText(selectedMedia.url);
                      alert(
                        `${
                          selectedMedia.type === "image" ? "Image" : "Video"
                        } link copied to clipboard!`
                      );
                    }
                  }}
                  className="flex items-center space-x-1 hover:text-green-300 transition"
                >
                  <FaShareAlt />
                  <span>Share</span>
                </button>

                <button
                  onClick={toggleFullscreen}
                  className="flex items-center space-x-1 hover:text-yellow-300 transition"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? <FaCompress /> : <FaExpand />}
                  <span>{isFullscreen ? "Exit" : "Fullscreen"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        className="fixed bottom-8 right-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white p-4 rounded-full shadow-xl hover:scale-110 transition-transform"
      >
        <FaHotel className="text-xl" />
      </button>
    </div>
  );
};

export default HotelGallery;
