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
import { useFetcher, useSDK } from "@/lib/api";
import { usePersistStore } from "@/store/persist";
import { sdk } from "@expotes/sdk";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../ui/select";

interface FormValues {
	appId: string;
	runtimeVersion: string;
	storageId: string;
	cdnId: string;
	file: FileList;
	notes: string;
}

export function NewUpdateDialog() {
	const { teamId } = usePersistStore();
	return teamId ? <UpdateDialog key={teamId} teamId={teamId} /> : null;
}

function UpdateDialog({ teamId }: { teamId: string }) {
	const [open, setOpen] = useState(false);
	const fetcher = useFetcher();
	const {
		register,
		control,
		handleSubmit,
		reset,
		setError,
		clearErrors,
		formState: { errors, isSubmitting },
	} = useForm<FormValues>({
		defaultValues: {
			appId: "",
			runtimeVersion: "",
			storageId: "",
			cdnId: "",
			notes: "",
		},
	});

	const onSubmit = handleSubmit(async (data) => {
		clearErrors("root");
		const formData = new FormData();
		formData.append("appId", data.appId);
		formData.append("runtimeVersion", data.runtimeVersion);
		formData.append("file", data.file[0]);
		formData.append("notes", data.notes);
		formData.append(
			"options",
			JSON.stringify({
				storage: [
					{
						providerId: Number(data.storageId),
						cdnIds: [Number(data.cdnId)],
					},
				],
			}),
		);

		try {
			const response = await fetcher("/api/v1/updates/create", {
				method: "POST",
				body: formData,
			});
			if (!response.ok) {
				throw new Error(`Update upload failed (HTTP ${response.status}).`);
			}
			reset();
			setOpen(false);
		} catch (error) {
			setError("root", {
				message:
					error instanceof Error ? error.message : "Update upload failed.",
			});
		}
	});

	const { data: apps } = useSDK(sdk.v1.application.list, [{ teamId }]);
	const { data: cdnProviders } = useSDK(
		sdk.v1.provider.cdn.listCdnProviders,
		[],
	);
	const { data: storageProviders } = useSDK(
		sdk.v1.provider.storage.listStorageProviders,
		[],
	);

	return (
		<Dialog open={open} onOpenChange={setOpen}>
			<DialogTrigger asChild>
				<Button variant="outline">New Update</Button>
			</DialogTrigger>
			<DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
				<form onSubmit={onSubmit}>
					<DialogHeader>
						<DialogTitle>Create New Update</DialogTitle>
						<DialogDescription>
							Add a new update to share with your team. Click save when you are
							done.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 py-4">
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="appId" className="text-right">
								Application
							</Label>
							<div className="col-span-3">
								<Controller
									name="appId"
									control={control}
									rules={{ required: "Application is required" }}
									render={({ field }) => (
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger
												id="appId"
												ref={field.ref}
												onBlur={field.onBlur}
											>
												<SelectValue placeholder="Select application" />
											</SelectTrigger>
											<SelectContent>
												{apps?.map((app) => (
													<SelectItem key={app.id} value={app.id}>
														{app.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								/>
								{errors.appId && (
									<p className="text-red-500">{errors.appId.message}</p>
								)}
							</div>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="runtimeVersion" className="text-right">
								Runtime Version
							</Label>
							<div className="col-span-3">
								<Input
									id="runtimeVersion"
									type="text"
									placeholder="Enter runtime version"
									{...register("runtimeVersion", {
										required: "Runtime version is required",
									})}
								/>
								{errors.runtimeVersion && (
									<p className="text-red-500">
										{errors.runtimeVersion.message}
									</p>
								)}
							</div>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="storage" className="text-right">
								Storage
							</Label>
							<div className="col-span-3">
								<Controller
									name="storageId"
									control={control}
									rules={{ required: "Storage provider is required" }}
									render={({ field }) => (
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger
												id="storage"
												ref={field.ref}
												onBlur={field.onBlur}
											>
												<SelectValue placeholder="Select storage provider" />
											</SelectTrigger>
											<SelectContent>
												{storageProviders?.map((provider) => (
													<SelectItem
														key={provider.id}
														value={String(provider.id)}
													>
														{provider.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								/>
								{errors.storageId && (
									<p className="text-red-500">{errors.storageId.message}</p>
								)}
							</div>
						</div>
						<div className="grid grid-cols-4 items-center gap-4">
							<Label htmlFor="cdn" className="text-right">
								CDN
							</Label>
							<div className="col-span-3">
								<Controller
									name="cdnId"
									control={control}
									rules={{ required: "CDN provider is required" }}
									render={({ field }) => (
										<Select value={field.value} onValueChange={field.onChange}>
											<SelectTrigger
												id="cdn"
												ref={field.ref}
												onBlur={field.onBlur}
											>
												<SelectValue placeholder="Select CDN provider" />
											</SelectTrigger>
											<SelectContent>
												{cdnProviders?.map((provider) => (
													<SelectItem
														key={provider.id}
														value={String(provider.id)}
													>
														{provider.name}
													</SelectItem>
												))}
											</SelectContent>
										</Select>
									)}
								/>
								{errors.cdnId && (
									<p className="text-red-500">{errors.cdnId.message}</p>
								)}
							</div>
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
									{...register("file", { required: "File is required" })}
								/>
								<p className="mt-1 text-sm text-muted-foreground">
									Upload a ZIP file containing your update bundle
								</p>
								{errors.file && (
									<p className="text-red-500">{errors.file.message}</p>
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
								{...register("notes")}
							/>
						</div>
						{errors.root && (
							<p role="alert" className="text-red-500">
								{errors.root.message}
							</p>
						)}
					</div>
					<DialogFooter>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? "Uploading…" : "Save Update"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	);
}
