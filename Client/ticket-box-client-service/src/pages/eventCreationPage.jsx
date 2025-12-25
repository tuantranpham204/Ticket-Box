import React, { useState, useEffect, useRef } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
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
  PlusCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Calendar,
  User,
  Edit2,
  Eye,
  X,
  CheckCircle,
  CloudUpload
} from "lucide-react";
import { useCreateEventMutation, useUpdateEventMutation, useEventByEventId, useCancelEventMutation } from "../hooks/useEventHook";
import { useCreateTicketMutation, useUpdateTicketMutation, useGetTicketsByEventId } from "../hooks/useTicketHook";
import { CAT, EVENT_STATUS, TICKET_STATUS } from "../utils/util";

const DocumentPreviewModal = ({ url, title, onClose }) => {
  if (!url) return null;

  const isImage = (url) => {
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(url) || url.startsWith("blob:");
  };

  const imageUrl = url.startsWith("http://") ? url.replace("http://", "https://") : url;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/80 p-4 backdrop-blur-xl">
      <div className="relative flex h-[90vh] w-full max-w-5xl flex-col rounded-[2.5rem] liquid-glass border border-white/10 shadow-2xl lighting-effect ring-1 ring-white/20">
        <div className="flex items-center justify-between border-b border-white/5 p-8">
          <h2 className="text-2xl font-black tracking-tighter text-white uppercase">{title || "Document Preview"}</h2>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition-all active:scale-95"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden p-6 bg-gray-950/40">
          {isImage(imageUrl) ? (
            <div className="flex h-full w-full items-center justify-center overflow-auto rounded-2xl bg-black/20 ring-1 ring-white/5">
              <img
                src={imageUrl}
                alt={title}
                className="max-h-full max-w-full object-contain p-4"
              />
            </div>
          ) : (
            <iframe
              src={imageUrl}
              title={title}
              className="h-full w-full border-none rounded-2xl bg-white"
            />
          )}
        </div>
      </div>
    </div>
  );
};

const EventCreationPage = () => {
  const navigate = useNavigate();
  const { eventId } = useParams();
  const isUpdateMode = !!eventId;
  const [isTicketsOpen, setIsTicketsOpen] = useState(true);

  // --- Preview Modal State ---
  const [previewUrl, setPreviewUrl] = useState(null);
  const [previewTitle, setPreviewTitle] = useState("");

  // --- Preview States (Middleware for Visuals) ---
  const [imgPreview, setImgPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);

  // --- Custom Dropdown States ---
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);
  const categoryDropdownTimeoutRef = useRef(null);

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      online: "false",
      category: CAT.MUSIC,
      tickets: [
        {
          type: "",
          unitPrice: "",
          capacity: "",
          startSale: "",
          endSale: "",
          minQtyPerOrder: 1,
          maxQtyPerOrder: 5,
        },
      ],
    },
  });

  const watchedCategory = watch("category");

  const handleCategoryMouseEnter = () => {
    if (categoryDropdownTimeoutRef.current) {
      clearTimeout(categoryDropdownTimeoutRef.current);
    }
    setIsCategoryDropdownOpen(true);
  };

  const handleCategoryMouseLeave = () => {
    categoryDropdownTimeoutRef.current = setTimeout(() => {
      setIsCategoryDropdownOpen(false);
    }, 300);
  };

  const handleCategorySelect = (val) => {
    setValue("category", val);
    setIsCategoryDropdownOpen(false);
  };

  const categories = [
    { value: CAT.MUSIC, label: "Music" },
    { value: CAT.STAGEART, label: "Stage & Art" },
    { value: CAT.SPORTS, label: "Sports" },
    { value: CAT.OTHER, label: "Other" },
  ];

  const { fields, append, remove, replace } = useFieldArray({
    control,
    name: "tickets",
  });

  const createEventMutation = useCreateEventMutation();
  const updateEventMutation = useUpdateEventMutation();
  const createTicketMutation = useCreateTicketMutation();
  const updateTicketMutation = useUpdateTicketMutation();
  const cancelEventMutation = useCancelEventMutation();

  const handleCancelEvent = async () => {
    if (!eventId) return;
    if (window.confirm("Are you sure you want to cancel this event creation request? This action cannot be undone.")) {
      try {
        await cancelEventMutation.mutateAsync(eventId);
        toast.success("Event canceled successfully!");
        navigate("/event-organizer");
      } catch (err) {
        toast.error(err.message || "Failed to cancel event.");
      }
    }
  };

  // --- Fetch Event & Ticket Data (Update Mode) ---
  const { data: eventToUpdate, isLoading: isFetchingEvent } = useEventByEventId(eventId);
  const { data: ticketsData, isLoading: isFetchingTickets } = useGetTicketsByEventId(eventId);

  // --- Effect: Pre-fill Form (Update Mode) ---
  useEffect(() => {
    if (isUpdateMode && eventToUpdate && !isFetchingEvent) {
      const resetData = {
        name: eventToUpdate.name,
        online: eventToUpdate.online.toString(),
        category: eventToUpdate.category?.id?.toString(),
        orgName: eventToUpdate.orgName,
        orgInfo: eventToUpdate.orgInfo,
        startDate: eventToUpdate.startDate ? eventToUpdate.startDate.slice(0, 16) : "",
        endDate: eventToUpdate.endDate ? eventToUpdate.endDate.slice(0, 16) : "",
      };

      if (!eventToUpdate.online && eventToUpdate.address) {
        try {
          const addr = JSON.parse(eventToUpdate.address);
          resetData.venue = addr.venue;
          resetData.location = addr.location;
          resetData.city = addr.city;
        } catch (e) {
          resetData.location = eventToUpdate.address;
        }
      }

      // Pre-fill tickets from separate endpoint if they exist
      const actualTickets = ticketsData?.pageContent || (Array.isArray(ticketsData) ? ticketsData : []);

      if (actualTickets && actualTickets.length > 0) {
        const mappedTickets = actualTickets.map(t => ({
          id: t.id,
          type: t.type,
          unitPrice: (t.unitPrice || t.ticketPrice || 0).toString(),
          capacity: t.capacity.toString(),
          startSale: t.startSale ? t.startSale.slice(0, 16) : "",
          endSale: t.endSale ? t.endSale.slice(0, 16) : "",
          minQtyPerOrder: t.minQtyPerOrder || 1,
          maxQtyPerOrder: t.maxQtyPerOrder || 5,
        }));
        replace(mappedTickets);
        resetData.tickets = mappedTickets;
      }

      // Populate the form using reset
      reset(resetData);
    }
  }, [isUpdateMode, eventToUpdate, ticketsData, isFetchingEvent, isFetchingTickets, reset, replace]);

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
      let formData = null;
      const fileFields = ["img", "banner", "contract", "info"];
      const hasFiles = fileFields.some(field => data[field]?.[0]);

      if (hasFiles) {
        formData = new FormData();
        if (data.img?.[0]) formData.append("img", data.img[0]);
        if (data.banner?.[0]) formData.append("banner", data.banner[0]);
        if (data.contract?.[0]) formData.append("contract", data.contract[0]);
        if (data.info?.[0]) formData.append("info", data.info[0]);
      }

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

      // 4. Create/Update Event
      let finalEventId = eventId;
      if (isUpdateMode) {
        await updateEventMutation.mutateAsync({
          eventId,
          generalData,
          formData,
        });
      } else {
        const eventResponse = await createEventMutation.mutateAsync({
          generalData,
          formData,
        });
        finalEventId = eventResponse.id;
      }

      // 5. Ticket Management
      const ticketPromises = data.tickets.map((ticket) => {
        const ticketData = {
          type: ticket.type,
          unitPrice: parseFloat(ticket.unitPrice),
          capacity: parseInt(ticket.capacity),
          startSale: ticket.startSale,
          endSale: ticket.endSale,
          minQtyPerOrder: parseInt(ticket.minQtyPerOrder),
          maxQtyPerOrder: parseInt(ticket.maxQtyPerOrder),
          status: TICKET_STATUS.PENDING,
        };

        if (ticket.id) {
          // Update existing ticket
          return updateTicketMutation.mutateAsync({
            ticketId: ticket.id,
            ticketData,
          });
        } else {
          // Create new ticket
          return createTicketMutation.mutateAsync({
            eventId: finalEventId,
            ticketData,
          });
        }
      });

      await Promise.all(ticketPromises);

      toast.success(`Event ${isUpdateMode ? "updated" : "created"} successfully!`);
      navigate("/event-organizer");
    } catch (error) {
      console.error(error);
      toast.error(error.message || "Failed to process request");
    }
  };

  const isLoading =
    createEventMutation.isPending ||
    updateEventMutation.isPending ||
    createTicketMutation.isPending ||
    updateTicketMutation.isPending ||
    isFetchingEvent ||
    isFetchingTickets;

  if (isUpdateMode && isFetchingEvent) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-600">Syncing Metadata...</span>
        </div>
      </div>
    );
  }

  const inputClasses = "w-full rounded-2xl border border-white/5 bg-white/5 p-4 text-white placeholder-gray-600 transition-all focus:border-blue-500/50 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-blue-500/20";
  const labelClasses = "mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1";

  return (
    <div className="min-h-screen bg-gray-950 px-4 py-12 text-white lighting-effect">
      <div className="container mx-auto max-w-7xl">
        <div className="mb-12">
          <h1 className="text-4xl font-black tracking-tighter uppercase">
            {isUpdateMode ? "Event Configuration Refinement" : "Initialize Event Manifest"}
          </h1>
          <p className="text-gray-500 mt-2 font-medium tracking-tight uppercase text-xs">
            {isUpdateMode ? "Refine and synchronize your event configuration to maintain operational excellence." : "Deploy a new event instance to the global network."}
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-12 lg:grid-cols-3">
          {/* === LEFT COLUMN (Main Info) === */}
          <div className="space-y-12 lg:col-span-2">
            {/* Event Details Section */}
            <div className={`rounded-[2.5rem] liquid-glass p-8 shadow-2xl border border-white/5 relative group transition-all duration-300 ${isCategoryDropdownOpen ? 'z-50 ring-2 ring-blue-500/20' : 'z-10'}`}>
              <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
                <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:rotate-12 group-hover:scale-110">
                  <FileText className="h-48 w-48" />
                </div>
              </div>
              <h2 className="mb-8 flex items-center gap-3 text-xl font-black tracking-tighter uppercase text-blue-400">
                <FileText className="h-6 w-6" /> Core Event Metadata
              </h2>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Name */}
                <div className="md:col-span-2">
                  <label className={labelClasses}>Event Name</label>
                  <input
                    {...register("name", { required: "Event name is required" })}
                    className={inputClasses}
                    placeholder="e.g. Summer Music Festival 2025"
                  />
                  {errors.name && (
                    <span className="mt-2 block text-[10px] font-bold uppercase text-rose-500">{errors.name.message}</span>
                  )}
                </div>

                {/* Category */}
                <div>
                  <label className={labelClasses}>Category</label>
                  <div
                    className="relative"
                    onMouseEnter={handleCategoryMouseEnter}
                    onMouseLeave={handleCategoryMouseLeave}
                  >
                    <button
                      type="button"
                      className={`${inputClasses} flex w-full items-center justify-between text-left`}
                      onClick={() => setIsCategoryDropdownOpen(!isCategoryDropdownOpen)}
                    >
                      <span className={watchedCategory ? "text-white" : "text-gray-500"}>
                        {categories.find(c => c.value === watchedCategory)?.label || "Select Category"}
                      </span>
                      <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform duration-300 ${isCategoryDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isCategoryDropdownOpen && (
                      <div className="absolute top-full z-50 mt-2 w-full animate-bounce-in">
                        <div className="overflow-hidden rounded-2xl border border-white/10 bg-gray-900/90 p-2 shadow-2xl backdrop-blur-xl ring-1 ring-white/10">
                          {categories.map((cat) => (
                            <button
                              key={cat.value}
                              type="button"
                              onClick={() => handleCategorySelect(cat.value)}
                              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${watchedCategory === cat.value
                                ? "bg-blue-600 text-white"
                                : "text-gray-400 hover:bg-white/5 hover:text-white"
                                }`}
                            >
                              {cat.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                    <input type="hidden" {...register("category", { required: true })} />
                  </div>
                </div>

                {/* Type */}
                <div>
                  <label className={labelClasses}>Event Type</label>
                  <div className="flex h-[58px] items-center gap-6 rounded-2xl border border-white/5 bg-white/5 px-6">
                    <label className="flex cursor-pointer items-center gap-3 group/radio">
                      <input
                        type="radio"
                        value="false"
                        {...register("online")}
                        className="h-4 w-4 border-white/10 bg-transparent text-blue-500 focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/radio:text-white transition-colors">Physical</span>
                    </label>
                    <label className="flex cursor-pointer items-center gap-3 group/radio">
                      <input
                        type="radio"
                        value="true"
                        {...register("online")}
                        className="h-4 w-4 border-white/10 bg-transparent text-blue-500 focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 group-hover/radio:text-white transition-colors">Virtual</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Location & Time Section */}
            <div className="rounded-[2.5rem] liquid-glass p-8 shadow-2xl border border-white/5 relative group">
              <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
                <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:rotate-12 group-hover:scale-110">
                  <MapPin className="h-48 w-48" />
                </div>
              </div>
              <h2 className="mb-8 flex items-center gap-3 text-xl font-black tracking-tighter uppercase text-emerald-400">
                <Calendar className="h-6 w-6" /> Spatio-Temporal Parameters
              </h2>

              <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                {/* Start Date */}
                <div>
                  <label className={labelClasses}>Start Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-4.5 h-5 w-5 text-gray-600" />
                    <input
                      type="datetime-local"
                      {...register("startDate", { required: "Start date is required" })}
                      className={`${inputClasses} pl-12 [color-scheme:dark]`}
                    />
                  </div>
                </div>
                {/* End Date */}
                <div>
                  <label className={labelClasses}>End Date</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-4.5 h-5 w-5 text-gray-600" />
                    <input
                      type="datetime-local"
                      {...register("endDate", { required: "End date is required" })}
                      className={`${inputClasses} pl-12 [color-scheme:dark]`}
                    />
                  </div>
                </div>

                {/* Venue */}
                <div>
                  <label className={`${labelClasses} ${!isOffline ? "opacity-30" : ""}`}>Venue</label>
                  <div className="relative">
                    <Building2 className={`absolute left-4 top-4.5 h-5 w-5 ${!isOffline ? "text-gray-800" : "text-gray-600"}`} />
                    <input
                      {...register("venue", { required: isOffline ? "Venue is required" : false })}
                      disabled={!isOffline}
                      className={`${inputClasses} pl-12 ${!isOffline ? "opacity-30 cursor-not-allowed" : ""}`}
                      placeholder={!isOffline ? "N/A" : "e.g. My Dinh Stadium"}
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className={`${labelClasses} ${!isOffline ? "opacity-30" : ""}`}>City</label>
                  <div className="relative">
                    <Map className={`absolute left-4 top-4.5 h-5 w-5 ${!isOffline ? "text-gray-800" : "text-gray-600"}`} />
                    <input
                      {...register("city", { required: isOffline ? "City is required" : false })}
                      disabled={!isOffline}
                      className={`${inputClasses} pl-12 ${!isOffline ? "opacity-30 cursor-not-allowed" : ""}`}
                      placeholder={!isOffline ? "N/A" : "e.g. Hanoi"}
                    />
                  </div>
                </div>

                {/* Street Address */}
                <div className="md:col-span-2">
                  <label className={`${labelClasses} ${!isOffline ? "opacity-30" : ""}`}>Street Address</label>
                  <div className="relative">
                    <MapPin className={`absolute left-4 top-4.5 h-5 w-5 ${!isOffline ? "text-gray-800" : "text-gray-600"}`} />
                    <input
                      {...register("location", { required: isOffline ? "Street address is required" : false })}
                      disabled={!isOffline}
                      className={`${inputClasses} pl-12 ${!isOffline ? "opacity-30 cursor-not-allowed" : ""}`}
                      placeholder={!isOffline ? "N/A" : "e.g. 1 Le Duc Tho, My Dinh"}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Organizer Section */}
            <div className="rounded-[2.5rem] liquid-glass p-8 shadow-2xl border border-white/5 relative group">
              <div className="absolute inset-0 overflow-hidden rounded-[2.5rem] pointer-events-none">
                <div className="absolute -top-10 -right-10 opacity-5 group-hover:opacity-10 transition-all duration-700 group-hover:rotate-12 group-hover:scale-110">
                  <User className="h-48 w-48" />
                </div>
              </div>
              <h2 className="mb-8 flex items-center gap-3 text-xl font-black tracking-tighter uppercase text-amber-400">
                <User className="h-6 w-6" /> Entity Credentials
              </h2>
              <div className="space-y-8">
                <div>
                  <label className={labelClasses}>Organizer Name</label>
                  <input
                    {...register("orgName", { required: "Organizer name is required" })}
                    className={inputClasses}
                  />
                </div>
                <div>
                  <label className={labelClasses}>Organizer Bio</label>
                  <textarea
                    {...register("orgInfo", { required: "Description is required" })}
                    rows="4"
                    className={`${inputClasses} resize-none`}
                    placeholder="Tell people what your organizer is about..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* === RIGHT COLUMN (Media & Documents) === */}
          <div className="space-y-12 lg:col-span-1">
            <div className="sticky top-24 rounded-[2.5rem] liquid-glass p-8 shadow-2xl border border-white/5">
              <h2 className="mb-8 flex items-center gap-3 text-xl font-black tracking-tighter uppercase text-violet-400">
                <ImageIcon className="h-6 w-6" /> Visual Assets & Branding
              </h2>

              <div className="space-y-8">
                {/* Thumbnail Image with Preview */}
                <div>
                  <label className={labelClasses}>
                    Thumbnail Image {!isUpdateMode && <span className="text-rose-500">*</span>}
                  </label>
                  <label className="group flex h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-white/10 hover:border-blue-500/50 hover:bg-white/5 transition-all relative">
                    {imgPreview || (isUpdateMode && eventToUpdate?.img?.url) ? (
                      <img
                        src={imgPreview || eventToUpdate?.img?.url}
                        alt="Thumbnail"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3">
                        <CloudUpload className="h-8 w-8 text-gray-700 group-hover:text-blue-500 transition-colors" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Initial Upload</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      {...register("img", { required: isUpdateMode ? false : "Thumbnail is required" })}
                    />
                  </label>
                  {errors.img && (
                    <p className="mt-2 text-[10px] font-bold uppercase text-rose-500">{errors.img.message}</p>
                  )}
                </div>

                {/* Banner Image with Preview */}
                <div>
                  <label className={labelClasses}>
                    Banner Image {!isUpdateMode && <span className="text-rose-500">*</span>}
                  </label>
                  <label className="group flex h-48 w-full cursor-pointer flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed border-white/10 hover:border-emerald-500/50 hover:bg-white/5 transition-all relative">
                    {bannerPreview || (isUpdateMode && eventToUpdate?.banner?.url) ? (
                      <img
                        src={bannerPreview || eventToUpdate?.banner?.url}
                        alt="Banner"
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-3">
                        <CloudUpload className="h-8 w-8 text-gray-700 group-hover:text-emerald-500 transition-colors" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-600">Initial Upload</p>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      {...register("banner", { required: isUpdateMode ? false : "Banner is required" })}
                    />
                  </label>
                  {errors.banner && (
                    <p className="mt-2 text-[10px] font-bold uppercase text-rose-500">{errors.banner.message}</p>
                  )}
                </div>

                {/* PDF Info with Filename Display */}
                <div className="space-y-4">
                  <label className={labelClasses}>Event Info (PDF)</label>
                  <div className="flex flex-col gap-3">
                    <label className="flex h-12 cursor-pointer items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-gray-950 transition-all active:scale-95">
                      Select File
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        {...register("info", { required: isUpdateMode ? false : "Event Info PDF is required" })}
                      />
                    </label>

                    <div className="flex gap-2">
                      {watchedInfo?.[0] && (
                        <button
                          type="button"
                          onClick={() => {
                            const url = URL.createObjectURL(watchedInfo[0]);
                            setPreviewUrl(url);
                            setPreviewTitle("Local Event Info Preview");
                          }}
                          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-blue-500/20"
                        >
                          <Eye className="h-4 w-4" /> Preview
                        </button>
                      )}

                      {isUpdateMode && eventToUpdate?.info?.url && (
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewUrl(eventToUpdate.info.url);
                            setPreviewTitle("Current Event Info");
                          }}
                          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-gray-900 border border-white/5 text-gray-400 hover:bg-white hover:text-gray-950 transition-all text-[10px] font-black uppercase tracking-widest"
                        >
                          <Eye className="h-4 w-4" /> Original
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* PDF Contract with Filename Display */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <label className={labelClasses}>Contract (PDF)</label>
                  <div className="flex flex-col gap-3">
                    <label className="flex h-12 cursor-pointer items-center justify-center rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white hover:text-gray-950 transition-all active:scale-95">
                      Select File
                      <input
                        type="file"
                        accept=".pdf"
                        className="hidden"
                        {...register("contract", { required: isUpdateMode ? false : "Contract PDF is required" })}
                      />
                    </label>

                    <div className="flex gap-2">
                      {watchedContract?.[0] && (
                        <button
                          type="button"
                          onClick={() => {
                            const url = URL.createObjectURL(watchedContract[0]);
                            setPreviewUrl(url);
                            setPreviewTitle("Local Contract Preview");
                          }}
                          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-amber-500/10 text-amber-400 hover:bg-amber-500 hover:text-white transition-all text-[10px] font-black uppercase tracking-widest border border-amber-500/20"
                        >
                          <Eye className="h-4 w-4" /> Preview
                        </button>
                      )}

                      {isUpdateMode && eventToUpdate?.contract?.url && (
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewUrl(eventToUpdate.contract.url);
                            setPreviewTitle("Current Contract");
                          }}
                          className="flex-1 flex items-center justify-center gap-2 h-10 rounded-xl bg-gray-900 border border-white/5 text-gray-400 hover:bg-white hover:text-gray-950 transition-all text-[10px] font-black uppercase tracking-widest"
                        >
                          <Eye className="h-4 w-4" /> Original
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* === BOTTOM SECTION (Ticket Creation) === */}
          <div className="lg:col-span-3">
            <div className="overflow-hidden rounded-[2.5rem] liquid-glass border border-white/5 shadow-2xl">
              {/* Accordion Header */}
              <button
                type="button"
                onClick={() => setIsTicketsOpen(!isTicketsOpen)}
                className="flex w-full items-center justify-between p-8 transition-colors hover:bg-white/5"
              >
                <div className="flex items-center gap-6">
                  <div className="h-12 w-12 flex items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <Ticket className="h-6 w-6" />
                  </div>
                  <div className="text-left">
                    <h2 className="text-2xl font-black tracking-tighter uppercase leading-none">Access Tiering & Distribution</h2>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 mt-1 block">
                      {fields.length} Ticket Types
                    </span>
                  </div>
                </div>
                {isTicketsOpen ? (
                  <ChevronUp className="h-6 w-6 text-gray-600" />
                ) : (
                  <ChevronDown className="h-6 w-6 text-gray-600" />
                )}
              </button>

              {/* Accordion Body */}
              {isTicketsOpen && (
                <div className="border-t border-white/5 bg-black/20 p-8">
                  <div className="space-y-8">
                    {fields.map((field, index) => (
                      <div
                        key={field.id}
                        className="relative rounded-3xl border border-white/5 bg-white/5 p-8 group/ticket hover:bg-white/[0.07] transition-all"
                      >
                        <div className="mb-6 flex items-center justify-between">
                          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                            Ticket Type {index + 1}
                          </h3>
                          {fields.length > 1 && (
                            <button
                              type="button"
                              onClick={() => remove(index)}
                              className="h-10 w-10 flex items-center justify-center rounded-xl text-rose-500 hover:bg-rose-500 hover:text-white transition-all active:scale-95 border border-rose-500/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-6 items-start">
                          {/* Ticket Type Name */}
                          <div className="md:col-span-2 lg:col-span-1">
                            <label className={labelClasses}>Type Name</label>
                            <input
                              {...register(`tickets.${index}.type`, { required: "Required" })}
                              placeholder="e.g. VIP Core"
                              className={inputClasses}
                            />
                            {errors.tickets?.[index]?.type && (
                              <p className="mt-2 text-[10px] font-bold uppercase text-rose-500">{errors.tickets[index].type.message}</p>
                            )}
                          </div>

                          {/* Price */}
                          <div>
                            <label className={labelClasses}>Credit Cost (VND)</label>
                            <input
                              type="number"
                              {...register(`tickets.${index}.unitPrice`, { required: "Required", min: 0 })}
                              placeholder="0"
                              className={inputClasses}
                            />
                          </div>

                          {/* Capacity */}
                          <div>
                            <label className={labelClasses}>Node Capacity</label>
                            <input
                              type="number"
                              {...register(`tickets.${index}.capacity`, { required: "Required", min: 1 })}
                              placeholder="100"
                              className={inputClasses}
                            />
                          </div>

                          {/* Order Limits: Min */}
                          <div>
                            <label className={labelClasses}>Min Qty</label>
                            <input
                              type="number"
                              {...register(`tickets.${index}.minQtyPerOrder`, { required: "Required", min: 1 })}
                              placeholder="1"
                              className={inputClasses}
                            />
                          </div>

                          {/* Order Limits: Max */}
                          <div>
                            <label className={labelClasses}>Max Qty</label>
                            <input
                              type="number"
                              {...register(`tickets.${index}.maxQtyPerOrder`, { required: "Required", min: 1 })}
                              placeholder="5"
                              className={inputClasses}
                            />
                          </div>

                          {/* Dates */}
                          <div className="md:col-span-2 lg:col-span-1">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className={labelClasses}>Sale Start</label>
                                <input
                                  type="datetime-local"
                                  {...register(`tickets.${index}.startSale`, { required: true })}
                                  className={`${inputClasses} text-[10px] h-[58px] [color-scheme:dark]`}
                                />
                              </div>
                              <div>
                                <label className={labelClasses}>Sale End</label>
                                <input
                                  type="datetime-local"
                                  {...register(`tickets.${index}.endSale`, { required: true })}
                                  className={`${inputClasses} text-[10px] h-[58px] [color-scheme:dark]`}
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
                          minQtyPerOrder: 1,
                          maxQtyPerOrder: 5,
                        })
                      }
                      className="flex w-full items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-white/5 py-8 text-[10px] font-black uppercase tracking-[0.2em] text-gray-600 transition-all hover:border-emerald-500/30 hover:bg-emerald-500/5 hover:text-emerald-400 active:scale-[0.99]"
                    >
                      <Plus className="h-5 w-5" />
                      Add Another Ticket Type
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col md:flex-row justify-end items-center gap-6 pt-12 border-t border-white/5">
            {isUpdateMode && eventToUpdate?.status === EVENT_STATUS.PENDING && (
              <button
                type="button"
                onClick={handleCancelEvent}
                disabled={cancelEventMutation.isPending || isLoading}
                className="w-full md:w-auto flex items-center justify-center gap-3 rounded-2xl bg-rose-500/10 border border-rose-500/20 px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-rose-500 transition-all hover:bg-rose-500 hover:text-white active:scale-95 disabled:opacity-30"
              >
                {cancelEventMutation.isPending ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Cancel Event
                  </>
                )}
              </button>
            )}

            <button
              type="submit"
              disabled={isLoading || cancelEventMutation.isPending}
              className={`w-full md:w-auto flex items-center justify-center gap-4 rounded-3xl px-12 py-6 text-xs font-black uppercase tracking-[0.3em] text-white shadow-2xl transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${isUpdateMode
                ? "bg-blue-600 hover:bg-blue-500 shadow-blue-500/20"
                : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20"
                }`}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  Processing...
                </>
              ) : (
                isUpdateMode ? (
                  <>
                    <Edit2 className="h-5 w-5" />
                    Update Event
                  </>
                ) : (
                  <>
                    <PlusCircle className="h-5 w-5" />
                    Create Event
                  </>
                )
              )}
            </button>
          </div>
        </form>

        {/* Document Preview Modal */}
        <DocumentPreviewModal
          url={previewUrl}
          title={previewTitle}
          onClose={() => setPreviewUrl(null)}
        />
      </div>
    </div>
  );
};

export default EventCreationPage;