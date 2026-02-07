import ForecastForm from "@/components/ForecastForm";

export default function NewForecastPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <h1 className="text-xl font-bold mb-4">Create New Forecast</h1>
      <ForecastForm />
    </div>
  );
}
