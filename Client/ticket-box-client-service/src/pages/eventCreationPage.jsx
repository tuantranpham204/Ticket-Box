import React, { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  Loader2,
  MapPin,
  FileText,
  Image as ImageIcon,
  Building2,
  Map,
  Ticket,
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  X,
  CheckCircle
} from "lucide-react";
import { useCreateEventMutation } from "../hooks/useEventHook";
import { useCreateTicketMutation } from "../hooks/useTicketHook";
import { CAT, EVENT_STATUS, TICKET_STATUS } from "../utils/util";

const EventCreationPage = () => {
  const navigate = useNavigate();
  const [isTicketsOpen, setIsTicketsOpen] = useState(true);
  
  // --- Preview States (Middleware for Visuals) ---
  const [imgPreview, setImgPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      online: "false",
      tickets: [
        {
          type: "",
          unitPrice: "",
          capacity: "",
          startSale: "",
          endSale: "",
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tickets",
  });

  const createEventMutation = useCreateEventMutation();
  const createTicketMutation = useCreateTicketMutation();

  // --- Watch Fields for Logic & Previews ---
  const isOnline = watch("online");
  const isOffline = isOnline === "false";
  
  // Watch file inputs to trigger UI updates
  const watchedImg = watch("img");
  const watchedBanner = watch("banner");
  const watchedContract = watch("contract");
  const watchedInfo = watch("info");

  // --- Effect: Generate Image Previews ---
  useEffect(() => {
    if (watchedImg && watchedImg[0]) {
      const url = URL.createObjectURL(watchedImg[0]);
      setImgPreview(url);
      return () => URL.revokeObjectURL(url); // Cleanup memory
    } else {
      setImgPreview(null);
    }
  }, [watchedImg]);

  useEffect(() => {
    if (watchedBanner && watchedBanner[0]) {
      const url = URL.createObjectURL(watchedBanner[0]);
      setBannerPreview(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setBannerPreview(null);
    }
  }, [watchedBanner]);

  const onSubmit = async (data) => {
    try {
      // 1. Files
      const formData = new FormData();
      if (data.img?.[0]) formData.append("img", data.img[0]);
      if (data.banner?.[0]) formData.append("banner", data.banner[0]);
      if (data.contract?.[0]) formData.append("contract", data.contract[0]);
      if (data.info?.[0]) formData.append("info", data.info[0]);

      // 2. Address
      let addressJsonString = null;
      if (isOffline) {
        addressJsonString = JSON.stringify({
          venue: data.venue,
          location: data.location,
          city: data.city,
        });
      }

      const generalData = {
        name: data.name,
        online: data.online === "true",
        address: addressJsonString,
        category: { id: parseInt(data.category) },
        orgName: data.orgName,
        orgInfo: data.orgInfo,
        startDate: data.startDate,
        endDate: data.endDate,
        status: EVENT_STATUS.PENDING,
      };

      // 4. Create Event
      const eventResponse = await createEventMutation.mutateAsync({
        generalData,
        formData,
      });
      const newEventId = eventResponse.id;

      // 5. Create Tickets
      const ticketPromises = data.tickets.map((ticket) =>
        createTicketMutation.mutateAsync({
          eventId: newEventId,
          ticketData: {
            type: ticket.type,
            unitPrice: parseFloat(ticket.unitPrice),
            capacity: parseInt(ticket.capacity),
            startSale: ticket.startSale,
            endSale: ticket.endSale,
            status: TICKET_STATUS.PENDING,
          },
        })
      );

      await Promise.all(ticketPromises);

      toast.success("Event and tickets created successfully!");
      navigate("/");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to process request");
    }
  };

  const isLoading =
    createEventMutation.isPending || createTicketMutation.isPending;

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 text-white">
      <div className="mb-8 border-b border-gray-700 pb-4">
        <h1 className="text-3xl font-bold text-white">Create New Event</h1>
        <p className="mt-2 text-gray-400">
          Fill in the details to launch your event.
        </p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="grid grid-cols-1 gap-8 lg:grid-cols-3"
      >
        {/* === LEFT COLUMN (Main Info) === */}
        <div className="space-y-8 lg:col-span-2">
          {/* Event Details Section */}
          <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-blue-400">
              <FileText className="h-5 w-5" /> Event Details
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Name */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Event Name
                </label>
                <input
                  {...register("name", { required: "Event name is required" })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. Summer Music Festival 2025"
                />
                {errors.name && (
                  <span className="text-sm text-red-500">{errors.name.message}</span>
                )}
              </div>

              {/* Category */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Category
                </label>
                <select
                  {...register("category", { required: true })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 focus:border-blue-500"
                >
                  <option value={CAT.MUSIC}>Music</option>
                  <option value={CAT.STAGEART}>Stage & Art</option>
                  <option value={CAT.SPORTS}>Sports</option>
                  <option value={CAT.OTHER}>Other</option>
                </select>
              </div>

              {/* Type */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Event Type
                </label>
                <div className="flex h-[50px] items-center gap-4 rounded-lg border border-gray-600 bg-gray-700 px-4">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      value="false"
                      {...register("online")}
                      className="text-blue-500 focus:ring-blue-500"
                    />
                    <span>Offline</span>
                  </label>
                  <label className="flex cursor-pointer items-center gap-2">
                    <input
                      type="radio"
                      value="true"
                      {...register("online")}
                      className="text-blue-500 focus:ring-blue-500"
                    />
                    <span>Online</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Location & Time Section */}
          <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-blue-400">
              <MapPin className="h-5 w-5" /> Time & Location
            </h2>

            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Start Date */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  Start Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    {...register("startDate", { required: "Start date is required" })}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 pl-10 [color-scheme:dark]"
                  />
                </div>
              </div>
              {/* End Date */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">
                  End Date
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                  <input
                    type="datetime-local"
                    {...register("endDate", { required: "End date is required" })}
                    className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 pl-10 [color-scheme:dark]"
                  />
                </div>
              </div>

              {/* Venue */}
              <div>
                <label className={`mb-2 block text-sm font-medium ${!isOffline ? "text-gray-500" : "text-gray-300"}`}>
                  Venue
                </label>
                <div className="relative">
                  <Building2 className={`absolute left-3 top-3.5 h-5 w-5 ${!isOffline ? "text-gray-600" : "text-gray-400"}`} />
                  <input
                    {...register("venue", { required: isOffline ? "Venue is required" : false })}
                    disabled={!isOffline}
                    className={`w-full rounded-lg border p-3 pl-10 focus:outline-none ${!isOffline ? "border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed" : "border-gray-600 bg-gray-700 text-white focus:border-blue-500"}`}
                    placeholder={!isOffline ? "N/A" : "e.g. My Dinh Stadium"}
                  />
                </div>
              </div>

              {/* City */}
              <div>
                <label className={`mb-2 block text-sm font-medium ${!isOffline ? "text-gray-500" : "text-gray-300"}`}>
                  City
                </label>
                <div className="relative">
                  <Map className={`absolute left-3 top-3.5 h-5 w-5 ${!isOffline ? "text-gray-600" : "text-gray-400"}`} />
                  <input
                    {...register("city", { required: isOffline ? "City is required" : false })}
                    disabled={!isOffline}
                    className={`w-full rounded-lg border p-3 pl-10 focus:outline-none ${!isOffline ? "border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed" : "border-gray-600 bg-gray-700 text-white focus:border-blue-500"}`}
                    placeholder={!isOffline ? "N/A" : "e.g. Hanoi"}
                  />
                </div>
              </div>

              {/* Street Address */}
              <div className="md:col-span-2">
                <label className={`mb-2 block text-sm font-medium ${!isOffline ? "text-gray-500" : "text-gray-300"}`}>
                  Street Address
                </label>
                <div className="relative">
                  <MapPin className={`absolute left-3 top-3.5 h-5 w-5 ${!isOffline ? "text-gray-600" : "text-gray-400"}`} />
                  <input
                    {...register("location", { required: isOffline ? "Street address is required" : false })}
                    disabled={!isOffline}
                    className={`w-full rounded-lg border p-3 pl-10 focus:outline-none ${!isOffline ? "border-gray-700 bg-gray-800 text-gray-500 cursor-not-allowed" : "border-gray-600 bg-gray-700 text-white focus:border-blue-500"}`}
                    placeholder={!isOffline ? "N/A" : "e.g. 1 Le Duc Tho, My Dinh"}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Organizer Section */}
          <div className="rounded-xl bg-gray-800 p-6 shadow-lg">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-blue-400">
              <User className="h-5 w-5" /> Organizer Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-300">Organizer Name</label>
                <input
                  {...register("orgName", { required: "Organizer name is required" })}
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium text-gray-300">Organizer Bio</label>
                <textarea
                  {...register("orgInfo", { required: "Description is required" })}
                  rows="4"
                  className="w-full rounded-lg border border-gray-600 bg-gray-700 p-3 focus:border-blue-500 focus:outline-none"
                  placeholder="Tell people what your organizer is about..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* === RIGHT COLUMN (Media & Documents) === */}
        <div className="space-y-8 lg:col-span-1">
          <div className="sticky top-24 rounded-xl bg-gray-800 p-6 shadow-lg">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-semibold text-blue-400">
              <ImageIcon className="h-5 w-5" /> Media & Docs
            </h2>

            <div className="space-y-6">
              {/* Thumbnail Image with Preview */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                  Thumbnail Image <span className="text-red-500">*</span>
                </label>
                <label className="group flex h-40 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-600 hover:border-blue-500 hover:bg-gray-750 relative">
                  {imgPreview ? (
                    // Show Preview
                    <img 
                      src={imgPreview} 
                      alt="Thumbnail Preview" 
                      className="h-full w-full object-cover transition-opacity group-hover:opacity-75" 
                    />
                  ) : (
                    // Show Placeholder
                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                      <ImageIcon className="mb-3 h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    {...register("img", { required: "Thumbnail is required" })}
                  />
                </label>
                {errors.img && (
                  <p className="mt-1 text-xs text-red-500">{errors.img.message}</p>
                )}
              </div>

              {/* Banner Image with Preview */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                  Banner Image <span className="text-red-500">*</span>
                </label>
                <label className="group flex h-40 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-600 hover:border-blue-500 hover:bg-gray-750 relative">
                  {bannerPreview ? (
                    <img 
                      src={bannerPreview} 
                      alt="Banner Preview" 
                      className="h-full w-full object-cover transition-opacity group-hover:opacity-75" 
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center pb-6 pt-5">
                      <ImageIcon className="mb-3 h-8 w-8 text-gray-400" />
                      <p className="text-sm text-gray-500">Click to upload</p>
                    </div>
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    {...register("banner", { required: "Banner is required" })}
                  />
                </label>
                {errors.banner && (
                  <p className="mt-1 text-xs text-red-500">{errors.banner.message}</p>
                )}
              </div>

              {/* PDF Info with Filename Display */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                  <FileText className="h-4 w-4 text-green-400" /> Event Info (PDF) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
                    Choose File
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      {...register("info", { required: "Event Info PDF is required" })}
                    />
                  </label>
                  {/* Filename Display */}
                  <span className="truncate text-sm text-gray-400">
                    {watchedInfo?.[0]?.name || "No file chosen"}
                  </span>
                </div>
                {errors.info && (
                  <p className="mt-1 text-xs text-red-500">{errors.info.message}</p>
                )}
              </div>

              {/* PDF Contract with Filename Display */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-300">
                  <FileText className="h-4 w-4 text-green-400" /> Contract (PDF) <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <label className="flex cursor-pointer items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700">
                    Choose File
                    <input
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      {...register("contract", { required: "Contract PDF is required" })}
                    />
                  </label>
                  {/* Filename Display */}
                  <span className="truncate text-sm text-gray-400">
                    {watchedContract?.[0]?.name || "No file chosen"}
                  </span>
                </div>
                {errors.contract && (
                  <p className="mt-1 text-xs text-red-500">{errors.contract.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* === BOTTOM SECTION (Ticket Creation) === */}
        <div className="lg:col-span-3">
          <div className="overflow-hidden rounded-xl border border-gray-700 bg-gray-800 shadow-2xl">
            {/* Accordion Header */}
            <button
              type="button"
              onClick={() => setIsTicketsOpen(!isTicketsOpen)}
              className="flex w-full items-center justify-between bg-gray-800 p-6 transition-colors hover:bg-gray-750"
            >
              <div className="flex items-center gap-3 text-xl font-bold text-green-400">
                <Ticket className="h-6 w-6" />
                <span>Ticket Creation</span>
                <span className="ml-2 rounded-full bg-gray-700 px-3 py-1 text-sm text-gray-300">
                  {fields.length} Types
                </span>
              </div>
              {isTicketsOpen ? (
                <ChevronUp className="h-6 w-6 text-gray-400" />
              ) : (
                <ChevronDown className="h-6 w-6 text-gray-400" />
              )}
            </button>

            {/* Accordion Body */}
            {isTicketsOpen && (
              <div className="border-t border-gray-700 bg-gray-800/50 p-6">
                <div className="space-y-6">
                  {fields.map((field, index) => (
                    <div
                      key={field.id}
                      className="relative rounded-lg border border-gray-600 bg-gray-800 p-6 shadow-sm"
                    >
                      <div className="mb-4 flex items-center justify-between border-b border-gray-700 pb-2">
                        <h3 className="text-lg font-semibold text-white">
                          Ticket Type #{index + 1}
                        </h3>
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="rounded-full p-2 text-red-400 transition-colors hover:bg-red-900/20 hover:text-red-300"
                            title="Remove Ticket"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
                        {/* Ticket Type Name */}
                        <div className="md:col-span-2 lg:col-span-1">
                          <label className="mb-1 block text-sm text-gray-400">Type Name</label>
                          <input
                            {...register(`tickets.${index}.type`, { required: "Required" })}
                            placeholder="e.g. VIP"
                            className="w-full rounded bg-gray-700 border border-gray-600 p-2.5 text-white focus:border-green-500 focus:outline-none"
                          />
                          {errors.tickets?.[index]?.type && (
                            <p className="mt-1 text-xs text-red-500">{errors.tickets[index].type.message}</p>
                          )}
                        </div>

                        {/* Price */}
                        <div>
                          <label className="mb-1 block text-sm text-gray-400">Unit Price (VND)</label>
                          <input
                            type="number"
                            {...register(`tickets.${index}.unitPrice`, { required: "Required", min: 0 })}
                            placeholder="0"
                            className="w-full rounded bg-gray-700 border border-gray-600 p-2.5 text-white focus:border-green-500 focus:outline-none"
                          />
                        </div>

                        {/* Capacity */}
                        <div>
                          <label className="mb-1 block text-sm text-gray-400">Capacity</label>
                          <input
                            type="number"
                            {...register(`tickets.${index}.capacity`, { required: "Required", min: 1 })}
                            placeholder="100"
                            className="w-full rounded bg-gray-700 border border-gray-600 p-2.5 text-white focus:border-green-500 focus:outline-none"
                          />
                        </div>

                        {/* Dates */}
                        <div className="md:col-span-2 lg:col-span-1">
                          <div className="space-y-3">
                            <div>
                              <label className="block text-xs text-gray-500">Start Sale</label>
                              <input
                                type="datetime-local"
                                {...register(`tickets.${index}.startSale`, { required: true })}
                                className="w-full rounded bg-gray-700 border border-gray-600 p-2 text-xs text-white [color-scheme:dark]"
                              />
                            </div>
                            <div>
                              <label className="block text-xs text-gray-500">End Sale</label>
                              <input
                                type="datetime-local"
                                {...register(`tickets.${index}.endSale`, { required: true })}
                                className="w-full rounded bg-gray-700 border border-gray-600 p-2 text-xs text-white [color-scheme:dark]"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Add Ticket Button */}
                  <button
                    type="button"
                    onClick={() =>
                      append({
                        type: "",
                        unitPrice: "",
                        capacity: "",
                        startSale: "",
                        endSale: "",
                      })
                    }
                    className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-600 py-4 font-medium text-gray-400 transition-colors hover:border-green-500 hover:bg-green-900/10 hover:text-green-500"
                  >
                    <Plus className="h-5 w-5" />
                    Add Another Ticket Type
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* === SUBMIT BUTTON === */}
        <div className="lg:col-span-3 flex justify-end border-t border-gray-700 pt-6">
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 rounded-full bg-green-600 px-10 py-4 text-xl font-bold text-white shadow-lg transition-all hover:bg-green-700 hover:shadow-green-900/30 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-6 w-6 animate-spin" /> Processing...
              </>
            ) : (
              "Create Event"
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EventCreationPage;