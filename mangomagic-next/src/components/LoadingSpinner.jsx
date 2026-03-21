function LoadingSpinner({ label = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 text-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-orange-200 border-t-primary" />
      <p className="text-sm font-medium text-muted">{label}</p>
    </div>
  );
}

export default LoadingSpinner;
