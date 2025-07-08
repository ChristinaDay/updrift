import { jobProviders } from '@/lib/apihub';

export default function APIhubPage() {
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-4xl font-bold text-foreground mb-2">APIhub</h1>
        <p className="text-lg text-muted-foreground mb-8">
          All connected job API sources powering your UpFetch search. More sources = better results!
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {jobProviders.map((provider) => (
            <div key={provider.id} className="bg-card rounded-lg shadow border border-border p-6 flex items-center gap-4">
              {provider.logoUrl && (
                <img src={provider.logoUrl} alt={provider.displayName + ' logo'} className="w-12 h-12 rounded bg-muted object-contain" />
              )}
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-foreground">{provider.displayName}</h2>
                <p className="text-sm text-muted-foreground">Status: <span className="text-green-600 font-medium">Active</span></p>
                <p className="text-xs text-muted-foreground mt-1">Provider ID: {provider.id}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 