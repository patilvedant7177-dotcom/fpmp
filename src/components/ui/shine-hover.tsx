import { Button } from "@/components/ui/button";
import { Sparkles } from "lucide-react";

const ButtonShineHoverDemo = () => {
  return (
    <div className="p-8 flex flex-col items-center gap-6 bg-slate-900 rounded-2xl">
      <h2 className="text-white text-xl font-semibold">Shine Hover Effect</h2>
      <div className="flex gap-4">
        <Button className="bg-blue-600 hover:bg-blue-500 text-white px-8 h-12 text-lg shadow-lg">
          <Sparkles className="mr-2 h-5 w-5" />
          Default Shine
        </Button>
        
        <Button variant="outline" className="h-12 px-8 text-lg border-blue-500/50 text-blue-400 hover:text-blue-300">
          Outline Shine
        </Button>
      </div>
      <p className="text-slate-400 text-sm italic">Hover over the buttons to see the sweep effect</p>
    </div>
  );
};

export default ButtonShineHoverDemo;
