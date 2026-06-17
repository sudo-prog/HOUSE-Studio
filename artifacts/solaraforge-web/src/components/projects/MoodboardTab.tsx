import { useState, useRef, useCallback } from "react";
import { useAnalyzeMoodboard, SolaraSpec } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import {
  ImagePlus,
  X,
  Wand2,
  Leaf,
  Loader2,
  Plus,
  Upload,
  Sparkles,
  TreePine,
  Zap,
} from "lucide-react";

interface MoodboardTabProps {
  project: { id: number; name: string; description?: string | null };
}

export function MoodboardTab({ project }: MoodboardTabProps) {
  const { toast } = useToast();
  const [description, setDescription] = useState(project.description ?? "");
  const [urlInput, setUrlInput] = useState("");
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [uploadedPreviews, setUploadedPreviews] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [result, setResult] = useState<SolaraSpec | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const analyzeMoodboard = useAnalyzeMoodboard();

  const addUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    if (!trimmed.startsWith("http")) {
      toast({ title: "Invalid URL", description: "Please enter a valid image URL starting with http", variant: "destructive" });
      return;
    }
    if (imageUrls.includes(trimmed)) {
      toast({ title: "Already added", description: "This URL is already in your moodboard" });
      return;
    }
    setImageUrls(prev => [...prev, trimmed]);
    setUrlInput("");
  };

  const removeUrl = (url: string) => setImageUrls(prev => prev.filter(u => u !== url));

  const addFiles = useCallback((files: File[]) => {
    const imageFiles = files.filter(f => f.type.startsWith("image/"));
    if (imageFiles.length === 0) return;
    setUploadedFiles(prev => [...prev, ...imageFiles]);
    imageFiles.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        setUploadedPreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
    setUploadedPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    addFiles(files);
  }, [addFiles]);

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const onDragLeave = () => setIsDragOver(false);

  const handleAnalyze = async () => {
    if (!description.trim() && imageUrls.length === 0 && uploadedFiles.length === 0) {
      toast({ title: "Add some inspiration", description: "Enter a description or add images to analyze", variant: "destructive" });
      return;
    }

    try {
      if (uploadedFiles.length > 0) {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("description", description.trim() || "Analyze this habitat inspiration");
        if (imageUrls.length > 0) {
          formData.append("imageUrls", JSON.stringify(imageUrls));
        }
        uploadedFiles.forEach(file => formData.append("images", file));

        const res = await fetch("/api/moodboard/analyze", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) throw new Error("Analysis failed");
        const data: SolaraSpec = await res.json();
        setResult(data);
      } else {
        const data = await analyzeMoodboard.mutateAsync({
          data: { description: description.trim() || "Analyze this habitat inspiration", imageUrls },
        });
        setResult(data);
      }
    } catch {
      toast({ title: "Analysis failed", description: "Could not analyze your moodboard. Please try again.", variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const totalImages = imageUrls.length + uploadedFiles.length;
  const loading = analyzeMoodboard.isPending || isUploading;

  return (
    <div className="space-y-6">
      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Inputs */}
        <div className="space-y-4">
          <Card className="border-border/50 bg-card/50">
            <CardHeader className="pb-3">
              <CardTitle className="font-serif text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-accent" />
                Inspiration Input
              </CardTitle>
              <p className="text-xs text-muted-foreground">Describe your vision, add image URLs or drag-and-drop photos</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Description
                </label>
                <Textarea
                  placeholder="Describe the vibe, biome, or aesthetic you're inspired by — e.g. 'earthy forest retreat with living walls, solar canopy, and rammed earth walls'"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="min-h-[100px] bg-background/60 text-sm resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Image URLs
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="https://example.com/inspiration.jpg"
                    value={urlInput}
                    onChange={e => setUrlInput(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && addUrl()}
                    className="bg-background/60 text-sm"
                  />
                  <Button variant="outline" size="icon" onClick={addUrl} className="shrink-0">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {imageUrls.length > 0 && (
                  <div className="mt-2 space-y-1.5">
                    {imageUrls.map(url => (
                      <div key={url} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 border border-border/30 group">
                        <img
                          src={url}
                          alt="Inspiration"
                          className="w-10 h-10 rounded object-cover shrink-0"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <span className="text-xs text-muted-foreground truncate flex-1">{url}</span>
                        <button onClick={() => removeUrl(url)} className="text-muted-foreground hover:text-red-500 shrink-0">
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">
                  Upload Images
                </label>
                <div
                  onDrop={onDrop}
                  onDragOver={onDragOver}
                  onDragLeave={onDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
                    isDragOver
                      ? "border-accent bg-accent/5"
                      : "border-border/40 hover:border-accent/50 hover:bg-muted/20"
                  )}
                >
                  <Upload className={cn("h-8 w-8 mx-auto mb-2", isDragOver ? "text-accent" : "text-muted-foreground")} />
                  <p className="text-xs text-muted-foreground">
                    Drag & drop images here, or <span className="text-accent font-semibold">browse</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground/60 mt-1">PNG, JPG, WebP up to 5MB each</p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={e => addFiles(Array.from(e.target.files ?? []))}
                  />
                </div>

                {uploadedPreviews.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {uploadedPreviews.map((src, i) => (
                      <div key={i} className="relative group">
                        <img src={src} alt={`Upload ${i + 1}`} className="w-16 h-16 rounded-lg object-cover border border-border/30" />
                        <button
                          onClick={() => removeFile(i)}
                          className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleAnalyze}
                disabled={loading}
                className="w-full bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing moodboard…
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4" />
                    Analyze Moodboard
                    {totalImages > 0 && <span className="ml-1 text-xs opacity-80">({totalImages} image{totalImages !== 1 ? "s" : ""})</span>}
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Results */}
        <div>
          {loading ? (
            <Card className="border-border/50 bg-card/50 h-full">
              <CardContent className="p-6 space-y-4">
                <Skeleton className="h-6 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
                <div className="flex gap-2">
                  {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="w-8 h-8 rounded-full" />)}
                </div>
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-3/5" />
              </CardContent>
            </Card>
          ) : result ? (
            <ConceptCard spec={result} />
          ) : (
            <EmptyState />
          )}
        </div>
      </div>
    </div>
  );
}

function ConceptCard({ spec }: { spec: SolaraSpec }) {
  return (
    <Card className="border-border/50 bg-card/50 overflow-hidden">
      <div className="h-2 w-full" style={{ background: `linear-gradient(to right, ${spec.palette.join(", ")})` }} />
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle className="font-serif text-xl">{spec.title}</CardTitle>
            <div className="flex items-center gap-1.5 mt-1.5">
              <TreePine className="h-3.5 w-3.5 text-primary" />
              <span className="text-sm text-muted-foreground">{spec.biome}</span>
            </div>
          </div>
          <Badge variant="outline" className="shrink-0 text-xs border-green-200 text-green-700 bg-green-50/50">
            {spec.estimatedCarbon > 0 ? "+" : ""}{spec.estimatedCarbon} kg CO₂e
          </Badge>
        </div>
        <div className="flex gap-1.5 flex-wrap mt-2">
          {spec.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
              {tag}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground leading-relaxed">{spec.summary}</p>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Palette</p>
          <div className="flex gap-2 flex-wrap">
            {spec.palette.map(hex => (
              <div key={hex} className="flex flex-col items-center gap-1">
                <div
                  className="w-8 h-8 rounded-full border border-border/40 shadow-sm"
                  style={{ backgroundColor: hex }}
                  title={hex}
                />
                <span className="text-[9px] text-muted-foreground font-mono">{hex}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Leaf className="h-3.5 w-3.5 text-primary" />
            Suggested Materials
          </p>
          <div className="space-y-1.5">
            {spec.suggestedMaterials.map(mat => (
              <div key={mat} className="flex items-center gap-2 text-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                <span>{mat}</span>
              </div>
            ))}
          </div>
        </div>

        {(spec.parametricHints.floorAreaSqm || spec.parametricHints.stories || spec.parametricHints.roofType || spec.parametricHints.primaryStructure) && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-accent" />
              Parametric Hints
            </p>
            <div className="grid grid-cols-2 gap-2">
              {spec.parametricHints.floorAreaSqm != null && (
                <div className="p-2 rounded-lg bg-muted/30 border border-border/20">
                  <p className="text-[10px] text-muted-foreground">Floor Area</p>
                  <p className="text-sm font-semibold">{spec.parametricHints.floorAreaSqm} m²</p>
                </div>
              )}
              {spec.parametricHints.stories != null && (
                <div className="p-2 rounded-lg bg-muted/30 border border-border/20">
                  <p className="text-[10px] text-muted-foreground">Stories</p>
                  <p className="text-sm font-semibold">{spec.parametricHints.stories}</p>
                </div>
              )}
              {spec.parametricHints.roofType && (
                <div className="p-2 rounded-lg bg-muted/30 border border-border/20">
                  <p className="text-[10px] text-muted-foreground">Roof Type</p>
                  <p className="text-sm font-semibold">{spec.parametricHints.roofType}</p>
                </div>
              )}
              {spec.parametricHints.primaryStructure && (
                <div className="p-2 rounded-lg bg-muted/30 border border-border/20">
                  <p className="text-[10px] text-muted-foreground">Primary Structure</p>
                  <p className="text-sm font-semibold">{spec.parametricHints.primaryStructure}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center border-2 border-dashed border-border/30 rounded-2xl bg-muted/10 p-8 space-y-4">
      <div className="w-16 h-16 rounded-2xl bg-accent/10 flex items-center justify-center">
        <ImagePlus className="h-8 w-8 text-accent" />
      </div>
      <div>
        <h3 className="font-serif text-lg font-bold mb-1">No concept generated yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Add a description or upload inspiration images, then click <strong>"Analyze Moodboard"</strong> to generate a SolaraSpec concept card.
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 text-xs text-muted-foreground">
        <Badge variant="outline" className="text-xs">🌿 Materials</Badge>
        <Badge variant="outline" className="text-xs">🎨 Palette</Badge>
        <Badge variant="outline" className="text-xs">🏠 Design Direction</Badge>
        <Badge variant="outline" className="text-xs">⚡ Parametric Hints</Badge>
      </div>
    </div>
  );
}
