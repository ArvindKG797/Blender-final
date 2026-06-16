import { Info } from 'lucide-react';
 
const ModelInfoIcon = () => {
  return (
    <div className="relative group flex items-center justify-center cursor-pointer text-slate-400 hover:text-brandOrange transition-colors">
      <Info className="w-5 h-5" />
 
      {/* Tooltip Box */}
      <div className="absolute bottom-full mb-4 left-0 w-80 sm:w-96 p-4 bg-white border border-slate-200 rounded-xl shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 text-sm text-slate-700">
     
        <p className="font-semibold text-slate-900 mb-2">Model Information</p>
        <p className="mb-4 text-slate-600">
          Generate Blender Python (BPY) scripts from natural language instructions.
        </p>
       
        {/* Input Example */}
        <div className="bg-blue-50 p-3 rounded-t-lg border border-blue-100 text-xs">
          <span className="font-bold text-blue-700 block mb-1">Example Input:</span>
          Generate a procedural winding staircase with 24 steps using sine and cosine for circular placement
        </div>
       
        {/* Output Example */}
        <div className="bg-slate-900 text-slate-100 p-3 rounded-b-lg border border-slate-800 font-mono text-xs whitespace-pre-wrap">
          <span className="font-bold text-green-400 block mb-1">Output:</span>
{`import bpy
import math
 
for i in range(24):
    bpy.ops.mesh.primitive_cube_add(
        scale=(1.5, 0.5, 0.1),
        location=(math.cos(i*0.5)*3, math.sin(i*0.5)*3, i*0.4)
    )
    bpy.context.active_object.rotation_euler[2] = i*0.5`}
        </div>
       
        {/* Category Badge */}
        <div className="mt-3 flex items-center gap-2">
          {/* <span className="text-xs text-slate-500 font-semibold">Category:</span>
          <span className="px-2 py-1 bg-slate-100 text-slate-600 text-[10px] uppercase font-bold rounded-full tracking-wider">
            procedural_generation
          </span> */}
        </div>
      </div>
    </div>
  );
};
 
export default ModelInfoIcon;