import LoadingSpinner from "../components/LoadingSpinner";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center w-full">
      <LoadingSpinner label="Loading..." />
    </div>
  );
}
