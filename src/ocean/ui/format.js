/** 83.456 -> "1:23.45" */
export const formatTime = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds - m * 60;
  return `${m}:${s.toFixed(2).padStart(5, '0')}`;
};
