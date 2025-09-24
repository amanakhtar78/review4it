"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { ICastMaster } from "@/lib/models/CastMaster";

const formSchema = z.object({
  castName: z.string().min(1, "Cast name is required"),
  castType: z.string().min(1, "Cast type is required"),
  imageUrl: z.string().optional(),
  expectedEarning: z.coerce.number().optional(),
  expectedPerformanceOrMovieMoney: z.string().optional(),
  extraInfo: z.string().optional(),
  status: z.enum(["Active", "Inactive"]).default("Active"),
});

type FormData = z.infer<typeof formSchema>;

interface CastMasterFormProps {
  initialData?: ICastMaster | null;
  onSubmit: (data: Partial<ICastMaster>) => void;
  onCancel: () => void;
}

export default function CastMasterForm({
  initialData,
  onSubmit,
  onCancel,
}: CastMasterFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          ...initialData,
          expectedEarning: initialData.expectedEarning || undefined,
        }
      : {
          castName: "",
          castType: "",
          imageUrl: "",
          expectedEarning: undefined,
          expectedPerformanceOrMovieMoney: "",
          extraInfo: "",
          status: "Active",
        },
  });

  React.useEffect(() => {
    if (initialData) {
      setValue("castName", initialData.castName);
      setValue("castType", initialData.castType);
      setValue("imageUrl", initialData.imageUrl || "");
      setValue("expectedEarning", initialData.expectedEarning);
      setValue(
        "expectedPerformanceOrMovieMoney",
        initialData.expectedPerformanceOrMovieMoney
      );
      setValue("extraInfo", initialData.extraInfo);
      setValue("status", initialData.status);
    }
  }, [initialData, setValue]);

  const processSubmit = (data: FormData) => {
    onSubmit(data);
  };

  return (
    <form
      onSubmit={handleSubmit(processSubmit)}
      className="space-y-4 py-4 max-h-[75vh] overflow-y-auto pr-4"
    >
      <div className="space-y-2">
        <Label htmlFor="castName">Cast Name</Label>
        <Input
          id="castName"
          {...register("castName")}
          placeholder="e.g., Chris Evans"
        />
        {errors.castName && (
          <p className="text-sm text-destructive mt-1">
            {errors.castName.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="castType">Cast Type</Label>
        <Input
          id="castType"
          {...register("castType")}
          placeholder="e.g., Lead Actor"
        />
        {errors.castType && (
          <p className="text-sm text-destructive mt-1">
            {errors.castType.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="imageUrl">Profile Image URL</Label>
        <Input
          id="imageUrl"
          {...register("imageUrl")}
          placeholder="https://example.com/actor-image.jpg"
          type="url"
        />
        {errors.imageUrl && (
          <p className="text-sm text-destructive mt-1">
            {errors.imageUrl.message}
          </p>
        )}
        <p className="text-xs text-muted-foreground">
          Enter a URL to the actor's profile image
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="expectedEarning">Expected Earning</Label>
        <Input
          id="expectedEarning"
          type="number"
          {...register("expectedEarning")}
        />
        {errors.expectedEarning && (
          <p className="text-sm text-destructive mt-1">
            {errors.expectedEarning.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="expectedPerformanceOrMovieMoney">
          Expected Performance
        </Label>
        <Input
          id="expectedPerformanceOrMovieMoney"
          {...register("expectedPerformanceOrMovieMoney")}
          placeholder="e.g., High"
        />
        {errors.expectedPerformanceOrMovieMoney && (
          <p className="text-sm text-destructive mt-1">
            {errors.expectedPerformanceOrMovieMoney.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="extraInfo">Extra Info</Label>
        <Textarea
          id="extraInfo"
          {...register("extraInfo")}
          placeholder="e.g., Played Captain Nova"
        />
        {errors.extraInfo && (
          <p className="text-sm text-destructive mt-1">
            {errors.extraInfo.message}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <Select
          onValueChange={(value) =>
            setValue("status", value as "Active" | "Inactive")
          }
          defaultValue={watch("status")}
        >
          <SelectTrigger id="status">
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        {errors.status && (
          <p className="text-sm text-destructive mt-1">
            {errors.status.message}
          </p>
        )}
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {initialData ? "Save Changes" : "Add Cast Member"}
        </Button>
      </div>
    </form>
  );
}
