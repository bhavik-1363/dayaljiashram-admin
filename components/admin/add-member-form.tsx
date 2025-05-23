"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AchievementList } from "@/components/admin/achievement-list";
import { FirebaseImageUpload } from "@/components/admin/firebase-image-upload";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { getMembersService } from "@/lib/firebase/services/members-service";
import { useToast } from "@/hooks/use-toast";
import { ImageUpload } from "./image-upload";

export function AddMemberForm({ onSubmit, onCancel, fields = [] }) {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // const handleImageChange = (url) => {
  //   setFormData((prev) => ({ ...prev, imageUrl: url }))
  // }

  const handleImageChange = async (value: string | File) => {
    try {
      // If we received a File object, upload it to Firebase Storage
      if (value instanceof File) {
        // setIsUploadingImage(true)

        const membersService = getMembersService();
        const downloadURL = await membersService.uploadProfileImage(value);

        setFormData({
          ...formData,
          imageUrl: downloadURL
        });

        toast({
          title: "Image uploaded successfully",
          description: "Profile image has been uploaded."
        });
      } else {
        // If we received a string (URL or empty string), just update the state
        setFormData({
          ...formData,
          imageUrl: value
        });
      }
    } catch (error) {
      console.error("Error handling image:", error);
      toast({
        title: "Upload failed",
        description: "There was a problem uploading your image.",
        variant: "destructive"
      });
    } finally {
      // setIsUploadingImage(false)
    }
  };

  const handleAchievementsChange = achievements => {
    setFormData(prev => ({ ...prev, achievements }));
  };

  const handleDateChange = (name, date) => {
    setFormData(prev => ({ ...prev, [name]: date }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {fields.map(field =>
        <div key={field.name} className="space-y-2">
          <Label htmlFor={field.name}>
            {field.label}
            {field.required && <span className="text-destructive"> *</span>}
          </Label>

          {field.type === "text" ||
          field.type === "email" ||
          field.type === "tel"
            ? <Input
                id={field.name}
                name={field.name}
                type={field.type}
                value={formData[field.name] || ""}
                onChange={handleChange}
                required={field.required}
              />
            : field.type === "textarea"
              ? <Textarea
                  id={field.name}
                  name={field.name}
                  value={formData[field.name] || ""}
                  onChange={handleChange}
                  required={field.required}
                />
              : field.type === "image"
                ? <ImageUpload
                    value={formData.imageUrl}
                    onChange={handleImageChange}
                    folderName="committee"
                  />
                : field.type === "dropdown"
                  ? <div>
                      <select
                        id={field.name}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                      >
                        {field.options.map(option =>
                          <option value={option}>
                            {option}
                          </option>
                        )}
                      </select>
                    </div>
                  : field.type === "number"
                    ? <Input
                        id={field.name}
                        name={field.name}
                        type={field.type}
                        value={formData[field.name] || ""}
                        onChange={handleChange}
                        required={field.required}
                      />
                    : field.type === "achievements"
                      ? <AchievementList
                          achievements={formData.achievements || []}
                          onChange={handleAchievementsChange}
                        />
                      : field.type === "date"
                        ? <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !formData[field.name] &&
                                    "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData[field.name]
                                  ? format(formData[field.name], "PPP")
                                  : <span>Pick a date</span>}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <Calendar
                                mode="single"
                                selected={formData[field.name]}
                                onSelect={date =>
                                  handleDateChange(field.name, date)}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        : null}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save"}
        </Button>
      </div>
    </form>
  );
}
