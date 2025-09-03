import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2, Plus } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function FoodMenuEntry({
  meals,
  tempMeal,
  tempMealImagePreview,
  handleTempMealChange,
  handleTempMealImageChange,
  addMeal,
  removeMeal,
  errors,
}) {
  return (
    <div className="space-y-6 bg-gray-50 p-6 rounded-xl">
      <h4 className="text-lg font-semibold text-gray-900">
        Add Meals (up to 20)
      </h4>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Meal Name *
          </Label>
          <Input
            name="name"
            value={tempMeal.name}
            onChange={handleTempMealChange}
            placeholder="e.g., Jollof Rice"
            className="rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Price (₦) *
          </Label>
          <Input
            type="number"
            name="price"
            value={tempMeal.price}
            onChange={handleTempMealChange}
            placeholder="e.g., 2500"
            className="rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">
            Description
          </Label>
          <Input
            name="description"
            value={tempMeal.description}
            onChange={handleTempMealChange}
            placeholder="e.g., Spicy rice with chicken"
            className="rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700">Image *</Label>
          <Input
            type="file"
            accept="image/*"
            onChange={handleTempMealImageChange}
            className="rounded-xl border-gray-300 focus:ring-2 focus:ring-blue-500"
          />
          {tempMealImagePreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <Image
                src={tempMealImagePreview}
                alt="Meal preview"
                width={80}
                height={80}
                className="object-cover rounded-xl mt-2 shadow-sm"
              />
            </motion.div>
          )}
        </div>
      </div>
      <Button
        type="button"
        onClick={addMeal}
        className="mt-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md"
      >
        <Plus className="w-4 h-4 mr-2" /> Add Meal
      </Button>
      {errors.meals && (
        <p className="text-sm text-red-500 font-medium">{errors.meals}</p>
      )}

      {meals.length > 0 && (
        <div className="mt-4 space-y-3">
          <h5 className="text-sm font-medium text-gray-700">Added Meals</h5>
          {meals.map((meal, index) => (
            <motion.div
              key={index}
              className="flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.1 }}
            >
              <div className="flex items-center space-x-4">
                {meal.imagePreview && (
                  <Image
                    src={meal.imagePreview}
                    alt={meal.name}
                    width={80}
                    height={80}
                    className="object-cover rounded-xl"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {meal.name} - ₦{meal.price}
                  </p>
                  <p className="text-sm text-gray-600">{meal.description}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => removeMeal(index)}
                className="hover:bg-red-100 rounded-full"
              >
                <Trash2 className="w-5 h-5 text-red-500" />
              </Button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
