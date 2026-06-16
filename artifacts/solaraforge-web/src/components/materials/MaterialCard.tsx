import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Material } from "@workspace/api-client-react";
import { Leaf, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";

interface MaterialCardProps {
  material: Material;
  showDetails?: boolean;
}

export function MaterialCard({ material, showDetails = false }: MaterialCardProps) {
  const isNegativeCarbon = material.embodiedCarbon < 0;

  const CardBody = (
    <Card className={cn(
      "overflow-hidden transition-all border-border/50 bg-card/50 backdrop-blur-sm h-full flex flex-col",
      !showDetails && "hover:shadow-md cursor-pointer group"
    )}>
      {material.imageUrl && (
        <div className="aspect-video relative overflow-hidden bg-muted">
          <img 
            src={material.imageUrl} 
            alt={material.name}
            className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
          />
          <Badge className="absolute top-2 right-2 bg-white/80 backdrop-blur-sm text-primary border-none">
            {material.category}
          </Badge>
        </div>
      )}
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-start gap-2">
          <h3 className="font-serif font-bold text-base group-hover:text-primary transition-colors">
            {material.name}
          </h3>
          <Badge 
            variant="outline"
            className={cn(
              "text-[10px] px-1.5 py-0 whitespace-nowrap",
              isNegativeCarbon 
                ? "bg-green-50 text-green-700 border-green-200" 
                : "bg-amber-50 text-amber-700 border-amber-200"
            )}
          >
            {material.embodiedCarbon} kg CO₂e
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex-1 flex flex-col">
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {material.description}
        </p>
        
        <div className="mt-auto space-y-3">
          <div className="flex flex-wrap gap-1">
            {material.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-[9px] px-1.5 py-0 bg-muted/50">
                {tag}
              </Badge>
            ))}
            {material.tags.length > 3 && (
              <span className="text-[9px] text-muted-foreground self-center">
                +{material.tags.length - 3}
              </span>
            )}
          </div>
          
          {showDetails && (
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/30">
              <div className="text-[10px]">
                <span className="text-muted-foreground block">Durability</span>
                <span className="font-medium">{material.durabilityYears} years</span>
              </div>
              <div className="text-[10px]">
                <span className="text-muted-foreground block">Recyclability</span>
                <span className="font-medium">{material.recyclability}%</span>
              </div>
              <div className="text-[10px] col-span-2">
                <span className="text-muted-foreground block">Availability</span>
                <span className="font-medium">{material.localAvailability}</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (showDetails) return CardBody;

  return (
    <Dialog>
      <DialogTrigger asChild>
        {CardBody}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-card border-none p-0 overflow-hidden">
        <div className="grid md:grid-cols-2">
          <div className="bg-muted aspect-square md:aspect-auto h-full">
            {material.imageUrl && (
              <img 
                src={material.imageUrl} 
                alt={material.name}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="p-6 overflow-y-auto max-h-[80vh]">
            <Badge variant="outline" className="mb-2 text-primary border-primary/20">
              {material.category}
            </Badge>
            <DialogHeader className="mb-4">
              <DialogTitle className="font-serif text-3xl font-bold">
                {material.name}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                {material.description}
              </p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <span className="text-xs text-muted-foreground block mb-1">Embodied Carbon</span>
                  <span className={cn(
                    "text-sm font-bold",
                    isNegativeCarbon ? "text-green-600" : "text-amber-600"
                  )}>
                    {material.embodiedCarbon} kg CO₂e/unit
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <span className="text-xs text-muted-foreground block mb-1">Durability</span>
                  <span className="text-sm font-bold">
                    {material.durabilityYears} Years
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <span className="text-xs text-muted-foreground block mb-1">Recyclability</span>
                  <span className="text-sm font-bold">
                    {material.recyclability}%
                  </span>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 border border-border/50">
                  <span className="text-xs text-muted-foreground block mb-1">Availability</span>
                  <span className="text-sm font-bold truncate">
                    {material.localAvailability}
                  </span>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-bold mb-2">Properties & Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {material.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function MaterialSkeleton() {
  return (
    <Card className="overflow-hidden animate-pulse border-border/50 bg-card/50">
      <div className="aspect-video bg-muted" />
      <div className="p-4 space-y-3">
        <div className="h-5 w-3/4 bg-muted rounded" />
        <div className="h-4 w-full bg-muted rounded" />
        <div className="h-4 w-2/3 bg-muted rounded" />
        <div className="flex gap-2">
          <div className="h-4 w-12 bg-muted rounded-full" />
          <div className="h-4 w-12 bg-muted rounded-full" />
        </div>
      </div>
    </Card>
  );
}
