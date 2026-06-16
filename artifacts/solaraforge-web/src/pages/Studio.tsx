import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wand2, Plus, X, Leaf, Sun, Layers, AlertCircle, Upload, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface SolaraSpec {
  title: string;
  biome: string;
  palette: string[];
  tags: string[];
  summary: string;
  suggestedMaterials: string[];
  parametricHints: {
    floorAreaSqm: number | null;
    stories: number | null;
    roofType: string | null;
    primaryStructure: string | null;
  };
  estimatedCarbon: number;
}

export default function Studio() {
  const { toast } = useToast();
  const [description, setDescription] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([""]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadPreviews, setUploadPreviews] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [spec, setSpec] = useState<SolaraSpec | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addImageUrl = () => setImageUrls(prev => [...prev, ""]);
  const removeImageUrl = (i: number) => setImageUrls(prev => prev.filter((_, idx) => idx !== i));
  const updateImageUrl = (i: number, val: string) =>
    setImageUrls(prev => prev.map((u, idx) => (idx === i ? val : u)));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const tooBig = files.filter(f => f.size > 5 * 1024 * 1024);
    if (tooBig.length) {
      toast({ title: "File too large", description: "Each image must be under 5 MB.", variant: "destructive" });
      return;
    }
    setUploadedFiles(prev => [...prev, ...files]);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        setUploadPreviews(prev => [...prev, ev.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeUpload = (i: number) => {
    setUploadedFiles(prev => prev.filter((_, idx) => idx !== i));
    setUploadPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const analyze = async () => {
    if (!description.trim()) {
      toast({ title: "Describe your vision", description: "Enter a description of your habitat concept to analyze.", variant: "destructive" });
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setSpec(null);

    try {
      const validUrls = imageUrls.filter(u => u.trim());
      const res = await fetch("/api/moodboard/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description: description.trim(), imageUrls: validUrls }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? `Server error ${res.status}`);
      }

      const data: SolaraSpec = await res.json();
      setSpec(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Analysis failed";
      setError(msg);
      toast({ title: "Analysis failed", description: msg, variant: "destructive" });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 pb-20 md:pb-8 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-serif text-4xl font-bold text-foreground">Moodboard Studio</h1>
        <p className="text-muted-foreground mt-2">Describe your habitat vision and let SolaraForge AI generate a <span className="text-accent font-semibold">SolaraSpec</span> — a structured concept card with biome, materials, and parametric hints.</p>
      </div>

      {/* Input Panel */}
      <Card className="border-border/50 bg-card/70 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 font-serif">
            <Wand2 className="h-5 w-5 text-accent" />
            Your Habitat Vision
          </CardTitle>
          <CardDescription>Describe the feeling, biome, or lifestyle of your dream regenerative habitat.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Textarea
            data-testid="input-description"
            placeholder="E.g. A low-impact earthship in the Arizona desert — passive solar, rammed earth walls, a food greenhouse corridor, rooftop cisterns and a mycelium insulation skin…"
            className="min-h-[120px] resize-none bg-background/50"
            value={description}
            onChange={e => setDescription(e.target.value)}
          />

          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Inspiration Images <span className="text-xs">(optional)</span></p>
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="h-9 bg-muted/50">
                <TabsTrigger value="upload" className="gap-1.5 text-xs">
                  <Upload className="h-3.5 w-3.5" /> Upload Files
                </TabsTrigger>
                <TabsTrigger value="url" className="gap-1.5 text-xs">
                  <ImageIcon className="h-3.5 w-3.5" /> Paste URLs
                </TabsTrigger>
              </TabsList>

              <TabsContent value="upload" className="mt-3 space-y-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleFileChange}
                  data-testid="input-file-upload"
                />
                <div
                  role="button"
                  tabIndex={0}
                  onClick={() => fileInputRef.current?.click()}
                  onKeyDown={e => e.key === "Enter" && fileInputRef.current?.click()}
                  className={cn(
                    "flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border/60 bg-background/40 p-8 cursor-pointer",
                    "hover:border-accent/50 hover:bg-accent/5 transition-colors text-center"
                  )}
                  data-testid="dropzone-upload"
                >
                  <Upload className="h-8 w-8 text-muted-foreground/50" />
                  <p className="text-sm font-medium text-muted-foreground">Click to upload images</p>
                  <p className="text-xs text-muted-foreground/60">PNG, JPG, WEBP — up to 5 MB each</p>
                </div>
                {uploadPreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {uploadPreviews.map((src, i) => (
                      <div key={i} className="relative group rounded-lg overflow-hidden border border-border/40 aspect-square bg-muted">
                        <img src={src} alt={`Upload ${i + 1}`} className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeUpload(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          data-testid={`button-remove-upload-${i}`}
                        >
                          <X className="h-3 w-3 text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="url" className="mt-3 space-y-2">
                <div className="flex justify-end">
                  <Button type="button" variant="ghost" size="sm" onClick={addImageUrl} data-testid="button-add-image-url">
                    <Plus className="h-4 w-4 mr-1" /> Add URL
                  </Button>
                </div>
                {imageUrls.map((url, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      data-testid={`input-image-url-${i}`}
                      placeholder="https://example.com/inspiration.jpg"
                      value={url}
                      onChange={e => updateImageUrl(i, e.target.value)}
                      className="bg-background/50"
                    />
                    {imageUrls.length > 1 && (
                      <Button type="button" variant="ghost" size="icon" onClick={() => removeImageUrl(i)} data-testid={`button-remove-image-url-${i}`}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </div>

          <Button
            data-testid="button-analyze"
            onClick={analyze}
            disabled={isAnalyzing || !description.trim()}
            className="w-full bg-accent text-accent-foreground hover:bg-accent/90 rounded-full font-bold shadow-lg"
            size="lg"
          >
            {isAnalyzing ? (
              <span className="flex items-center gap-2"><span className="animate-spin">🌿</span> Generating SolaraSpec…</span>
            ) : (
              <span className="flex items-center gap-2"><Wand2 className="h-5 w-5" /> Generate SolaraSpec</span>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Loading State */}
      {isAnalyzing && (
        <Card className="border-border/50 bg-card/50 animate-pulse">
          <CardContent className="p-6 space-y-4">
            <Skeleton className="h-8 w-2/3 rounded-lg" />
            <div className="flex gap-2">
              {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-6 w-16 rounded-full" />)}
            </div>
            <Skeleton className="h-20 w-full rounded-lg" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-16 rounded-lg" />
              <Skeleton className="h-16 rounded-lg" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {error && !isAnalyzing && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardContent className="p-6 flex items-start gap-3 text-destructive">
            <AlertCircle className="h-5 w-5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Analysis failed</p>
              <p className="text-sm opacity-80">{error}</p>
              {error.includes("credentials") && (
                <p className="text-xs mt-2 opacity-60">Set OPENAI_BASE_URL and OPENAI_API_KEY in your environment secrets to enable AI features.</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* SolaraSpec Result */}
      {spec && !isAnalyzing && (
        <div className="space-y-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-500">
          {/* Title + Biome */}
          <Card className="border-accent/30 bg-gradient-to-br from-primary/5 to-accent/5 overflow-hidden">
            <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${spec.palette.join(", ")})` }} />
            <CardContent className="p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-serif text-2xl font-bold text-foreground">{spec.title}</h2>
                  <Badge variant="secondary" className="mt-2 text-sm font-medium">
                    <Leaf className="h-3 w-3 mr-1" />
                    {spec.biome}
                  </Badge>
                </div>
                {/* Palette swatches */}
                <div className="flex gap-1.5">
                  {spec.palette.map((color, i) => (
                    <div
                      key={i}
                      data-testid={`swatch-palette-${i}`}
                      title={color}
                      className="w-8 h-8 rounded-full border-2 border-white/50 shadow-md"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <p className="mt-4 text-muted-foreground leading-relaxed">{spec.summary}</p>
              <div className="flex flex-wrap gap-2 mt-4">
                {spec.tags.map(tag => (
                  <Badge key={tag} variant="outline" data-testid={`tag-${tag}`} className="text-xs border-accent/30 text-accent">
                    {tag}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Est. Carbon", value: `${(spec.estimatedCarbon / 1000).toFixed(1)}t CO₂e`, icon: Leaf, color: spec.estimatedCarbon < 10000 ? "text-green-600" : "text-orange-500" },
              { label: "Floor Area", value: spec.parametricHints.floorAreaSqm ? `${spec.parametricHints.floorAreaSqm} m²` : "—", icon: Layers, color: "text-primary" },
              { label: "Stories", value: spec.parametricHints.stories ?? "—", icon: Layers, color: "text-primary" },
              { label: "Roof Type", value: spec.parametricHints.roofType ?? "—", icon: Sun, color: "text-accent" },
            ].map((m, i) => (
              <Card key={i} className="border-border/50 bg-card/50">
                <CardContent className="p-4 flex flex-col items-center text-center gap-1">
                  <m.icon className={cn("w-5 h-5 mb-1", m.color)} />
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{m.label}</p>
                  <p className="text-lg font-bold text-foreground">{m.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Suggested Materials + Structure */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-serif">Suggested Materials</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {spec.suggestedMaterials.map((mat, i) => (
                  <div key={i} data-testid={`material-suggestion-${i}`} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30">
                    <Leaf className="h-3 w-3 text-accent shrink-0" />
                    {mat}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-serif">Parametric Hints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                {[
                  { label: "Primary Structure", value: spec.parametricHints.primaryStructure },
                  { label: "Roof Type", value: spec.parametricHints.roofType },
                  { label: "Floor Area", value: spec.parametricHints.floorAreaSqm ? `${spec.parametricHints.floorAreaSqm} m²` : null },
                  { label: "Stories", value: spec.parametricHints.stories },
                ].map(({ label, value }) => (
                  <div key={label} className="flex justify-between items-center">
                    <span className="text-muted-foreground">{label}</span>
                    <span className="font-medium text-foreground">{value ?? <span className="text-muted-foreground/50 italic">not specified</span>}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <Separator />
          <p className="text-center text-xs text-muted-foreground">SolaraSpec generated by SolaraForge AI · Results are conceptual and should be validated with qualified designers.</p>
        </div>
      )}
    </div>
  );
}
