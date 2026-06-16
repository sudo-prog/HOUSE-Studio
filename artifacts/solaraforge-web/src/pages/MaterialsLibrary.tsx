import { useListMaterials } from "@workspace/api-client-react";
import { MaterialCard, MaterialSkeleton } from "@/components/materials/MaterialCard";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useState } from "react";
import { Database, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const CATEGORIES = [
  "All",
  "Wall Systems",
  "Structure",
  "Insulation",
  "Finishes",
  "Flooring",
  "Roofing"
];

export default function MaterialsLibrary() {
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  
  const { data: materials, isLoading } = useListMaterials({
    category: category === "All" ? undefined : category
  });

  const filteredMaterials = materials?.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase()) || 
    m.description.toLowerCase().includes(search.toLowerCase()) ||
    m.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="space-y-8 pb-20 md:pb-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-bold">Materials Library</h1>
          <p className="text-muted-foreground mt-1">Sustainably sourced, carbon-negative building blocks.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search materials..." 
            className="pl-9 bg-card/50" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <Tabs defaultValue="All" className="w-full" onValueChange={setCategory}>
        <div className="overflow-x-auto pb-2">
          <TabsList className="bg-card/50 border border-border/50 h-11 p-1">
            {CATEGORIES.map(cat => (
              <TabsTrigger 
                key={cat} 
                value={cat}
                className="rounded-md px-4 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                {cat}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        <TabsContent value={category} className="mt-6">
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {Array.from({ length: 8 }).map((_, i) => (
                <MaterialSkeleton key={i} />
              ))}
            </div>
          ) : filteredMaterials?.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center">
                <Database className="w-10 h-10 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-serif">No materials found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMaterials?.map(material => (
                <MaterialCard key={material.id} material={material} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
