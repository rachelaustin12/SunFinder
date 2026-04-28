import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Trash2, GripVertical, Save, MapPin, X, Loader2, Edit2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TrailMap from "./TrailMap";
import { motion, AnimatePresence } from "framer-motion";

const emptyStop = () => ({ name: "", address: "", notes: "", lat: null, lng: null });

export default function RouteBuilder({ route, onSaved, onCancel }) {
  const [name, setName] = useState(route?.name || "");
  const [description, setDescription] = useState(route?.description || "");
  const [stops, setStops] = useState(route?.stops?.length ? route.stops : [emptyStop()]);
  const [isSaving, setIsSaving] = useState(false);
  const [editingStop, setEditingStop] = useState(null); // index

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const reordered = Array.from(stops);
    const [removed] = reordered.splice(result.source.index, 1);
    reordered.splice(result.destination.index, 0, removed);
    setStops(reordered);
  };

  const addStop = () => {
    setStops([...stops, emptyStop()]);
    setEditingStop(stops.length);
  };

  const removeStop = (index) => {
    setStops(stops.filter((_, i) => i !== index));
    if (editingStop === index) setEditingStop(null);
  };

  const updateStop = (index, field, value) => {
    setStops(stops.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const handleSave = async () => {
    if (!name.trim() || stops.every(s => !s.name.trim())) return;
    setIsSaving(true);
    const validStops = stops.filter(s => s.name.trim());
    const data = { name: name.trim(), description: description.trim(), stops: validStops };
    if (route?.id) {
      await base44.entities.SavedRoute.update(route.id, data);
    } else {
      await base44.entities.SavedRoute.create(data);
    }
    setIsSaving(false);
    onSaved();
  };

  const mapStops = stops.filter(s => s.lat && s.lng && s.name);

  return (
    <div className="space-y-6">
      {/* Route name & description */}
      <div className="space-y-3">
        <Input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Route name (e.g. The Golden Mile)"
          className="text-base font-semibold h-11"
        />
        <Input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Short description (optional)"
          className="text-sm"
        />
      </div>

      {/* Stops */}
      <div>
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Stops</p>
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="stops">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                <AnimatePresence>
                  {stops.map((stop, i) => (
                    <Draggable key={i} draggableId={String(i)} index={i}>
                      {(drag) => (
                        <div ref={drag.innerRef} {...drag.draggableProps} className="bg-card border border-border/60 rounded-xl overflow-hidden">
                          <div className="flex items-center gap-2 px-3 py-2">
                            {/* Drag handle */}
                            <span {...drag.dragHandleProps} className="text-muted-foreground cursor-grab active:cursor-grabbing">
                              <GripVertical className="w-4 h-4" />
                            </span>
                            {/* Stop number */}
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0">
                              {i + 1}
                            </div>
                            {/* Name preview or input */}
                            {editingStop === i ? (
                              <Input
                                autoFocus
                                value={stop.name}
                                onChange={e => updateStop(i, "name", e.target.value)}
                                placeholder="Pub name"
                                className="flex-1 h-8 text-sm"
                              />
                            ) : (
                              <span className="flex-1 text-sm font-medium text-foreground truncate">
                                {stop.name || <span className="text-muted-foreground italic">Unnamed stop</span>}
                              </span>
                            )}
                            <button onClick={() => setEditingStop(editingStop === i ? null : i)} className="p-1 text-muted-foreground hover:text-foreground transition-colors">
                              {editingStop === i ? <Check className="w-4 h-4 text-primary" /> : <Edit2 className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => removeStop(i)} className="p-1 text-muted-foreground hover:text-destructive transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* Expanded fields */}
                          {editingStop === i && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="px-3 pb-3 space-y-2 border-t border-border/40 pt-2"
                            >
                              <Input
                                value={stop.address}
                                onChange={e => updateStop(i, "address", e.target.value)}
                                placeholder="Address"
                                className="text-xs h-8"
                              />
                              <Input
                                value={stop.notes}
                                onChange={e => updateStop(i, "notes", e.target.value)}
                                placeholder="Notes (e.g. great terrace, dog friendly)"
                                className="text-xs h-8"
                              />
                              <div className="flex gap-2">
                                <Input
                                  value={stop.lat || ""}
                                  onChange={e => updateStop(i, "lat", parseFloat(e.target.value) || null)}
                                  placeholder="Lat (optional)"
                                  className="text-xs h-8"
                                  type="number"
                                  step="any"
                                />
                                <Input
                                  value={stop.lng || ""}
                                  onChange={e => updateStop(i, "lng", parseFloat(e.target.value) || null)}
                                  placeholder="Lng (optional)"
                                  className="text-xs h-8"
                                  type="number"
                                  step="any"
                                />
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                </AnimatePresence>
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>

        <button
          onClick={addStop}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors text-sm"
        >
          <Plus className="w-4 h-4" /> Add Stop
        </button>
      </div>

      {/* Map preview */}
      {mapStops.length > 0 && (
        <div className="rounded-2xl overflow-hidden border border-border/60">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-4 pt-3 pb-2">Route Preview</p>
          <TrailMap stops={mapStops} />
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          <X className="w-4 h-4 mr-1" /> Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={isSaving || !name.trim() || stops.every(s => !s.name.trim())}
          className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />}
          Save Route
        </Button>
      </div>
    </div>
  );
}