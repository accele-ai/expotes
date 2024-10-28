import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useFetcher, useSDK, useSDKFetcher, useSDKMutation } from "@/lib/api";
import { usePersistStore } from "@/store/persist";
import { sdk } from "@expotes/sdk";
import { Loader2Icon } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import useSWRMutation from "swr/mutation";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface ManifestsOptions {
  storage: {
    providerId: number;
    cdnIds: number[];
  }[];
}

interface FormValues {
  appId: string;
  runtimeVersion: string;
  file: FileList;
  notes?: string;
}

export function NewUpdateDialog() {
  const { teamId } = usePersistStore();
  if (!teamId) return null;

  // const [options, setOptions] = useState<ManifestsOptions>({
  //   storage: [],
  // });
  const [cdn, setCdn] = useState<number | null>(null);
  const [storage, setStorage] = useState<number | null>(null);

  const fetcher = useFetcher();
  const { trigger } = useSWRMutation(
    "/v1/updates/create",
    (url, { arg }: { arg: FormValues & { options: ManifestsOptions } }) => {
      const formData = new FormData();
      formData.append("appId", arg.appId);
      formData.append("runtimeVersion", arg.runtimeVersion);
      formData.append("file", arg.file[0]);
      formData.append("options", JSON.stringify(arg.options));
      formData.append("notes", arg.notes ?? "");

      return fetcher(url, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: formData,
      });
    }
  );
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();

  const onSubmit = handleSubmit((data) => {
    if (!cdn || !storage) return;

    trigger({
      ...data,
      options: {
        storage: [
          {
            providerId: storage,
            cdnIds: [cdn],
          },
        ],
      },
    });
  });

  const { data: apps } = useSDK(sdk.v1.application.list, [{ teamId }]);

  const { data: cdnProviders } = useSDK(
    sdk.v1.provider.cdn.listCdnProviders,
    []
  );
  const { data: storageProviders } = useSDK(
    sdk.v1.provider.storage.listStorageProviders,
    []
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">New Update</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
        <form onSubmit={onSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Update</DialogTitle>
            <DialogDescription>
              Add a new update to share with your team. Click save when you're
              done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Application
              </Label>
              <Select {...register("appId", { required: true })}>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select application" />
                </SelectTrigger>
                <SelectContent>
                  {apps ? (
                    apps.map((app) => (
                      <SelectItem key={app.id} value={app.id}>
                        {app.name}
                      </SelectItem>
                    ))
                  ) : (
                    <Loader2Icon />
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">
                Runtime Version
              </Label>
              <div className="col-span-3">
                <Input
                  type="text"
                  placeholder="Enter runtime version"
                  className="cursor-pointer file:cursor-pointer"
                  {...register("runtimeVersion", { required: true })}
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="storage" className="text-right">
                Storage
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select storage provider" />
                </SelectTrigger>
                <SelectContent>
                  {storageProviders?.map((provider) => (
                    <SelectItem
                      key={provider.id}
                      value={provider.id.toString()}
                    >
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="cdn" className="text-right">
                CDN
              </Label>
              <Select>
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select CDN provider" />
                </SelectTrigger>
                <SelectContent>
                  {cdnProviders?.map((provider) => (
                    <SelectItem
                      key={provider.id}
                      value={provider.id.toString()}
                    >
                      {provider.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="file" className="text-right">
                Update Bundle
              </Label>
              <div className="col-span-3">
                <Input
                  id="file"
                  type="file"
                  accept=".zip"
                  className="cursor-pointer file:cursor-pointer"
                  {...register("file", { required: true })}
                />
                <p className="mt-1 text-sm text-muted-foreground">
                  Upload a ZIP file containing your update bundle
                </p>
                {errors.file && (
                  <span className="text-red-500">File is required</span>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Notes
              </Label>
              <Textarea
                id="description"
                placeholder="Enter update description"
                className="col-span-3"
                {...register("notes", { required: true })}
              />
              {errors.notes && (
                <span className="text-red-500">Description is required</span>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Save Update</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
