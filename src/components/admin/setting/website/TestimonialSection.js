"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import {
  addTestimonialAction,
  deleteTestimonialAction,
  reorderTestimonialsAction,
  updateTestimonialAction,
} from "@/actions/testimonial";
import {
  FormFeedback,
  INITIAL_STATE,
  Input,
  SubmitButton,
  Textarea,
} from "../ui";
import { FiMessageSquare, FiMoreVertical } from "react-icons/fi";

function sortTestimonials(items) {
  return [...items].sort((a, b) => {
    const left = Number(a?.sort_order || 0);
    const right = Number(b?.sort_order || 0);
    if (left !== right) return left - right;
    return Number(a?.id || 0) - Number(b?.id || 0);
  });
}

function reorderItems(items, startIndex, endIndex) {
  const next = [...items];
  const [moved] = next.splice(startIndex, 1);
  next.splice(endIndex, 0, moved);
  return next;
}

function TestimonialItemCard({ testimonial, index, onSuccess }) {
  const [updateState, updateAction] = useActionState(
    updateTestimonialAction,
    INITIAL_STATE,
  );
  const [deleteState, deleteAction] = useActionState(
    deleteTestimonialAction,
    INITIAL_STATE,
  );

  useEffect(() => {
    if (!updateState?.ok && !deleteState?.ok) return;
    onSuccess();
  }, [updateState?.ok, deleteState?.ok, onSuccess]);

  return (
    <Draggable draggableId={`testimonial-${testimonial.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`rounded-xl border bg-slate-50 p-3 transition ${
            snapshot.isDragging
              ? "border-blue-300 shadow-lg ring-2 ring-blue-100"
              : "border-slate-200"
          }`}
        >
          <div className='mb-3 flex items-start justify-between gap-3'>
            <p className='inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>
              <FiMessageSquare className='h-4 w-4' />
              Testimoni #{index + 1}
            </p>
            <button
              type='button'
              {...provided.dragHandleProps}
              className='inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700'
              aria-label='Geser urutan testimoni'
              title='Geser urutan testimoni'
            >
              <FiMoreVertical className='h-4 w-4' />
            </button>
          </div>

          <form action={updateAction} className='space-y-3'>
            <input type='hidden' name='testimonial_id' value={testimonial.id} />

            <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
              <Input
                label='Nama Klien'
                name='testimonial_client_name'
                defaultValue={testimonial.client_name}
                required
              />
              <Input
                label='Judul'
                name='testimonial_title'
                defaultValue={testimonial.title}
                required
              />
            </div>

            <Textarea
              label='Isi Testimoni'
              name='testimonial_quote'
              defaultValue={testimonial.quote}
              rows={4}
              required
            />

            <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
              <Input
                label='Link (Opsional)'
                name='testimonial_link_url'
                defaultValue={testimonial.link_url}
                placeholder='https://...'
              />
              <Input
                label='Rating (1-5)'
                name='testimonial_rating'
                type='number'
                min={1}
                max={5}
                defaultValue={testimonial.rating}
                required
              />
            </div>

            <label className='inline-flex items-center gap-2 text-sm font-medium text-slate-700'>
              <input
                type='checkbox'
                name='testimonial_is_active'
                value='1'
                defaultChecked={testimonial.is_active}
                className='h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500'
              />
              Tampilkan di homepage
            </label>

            <div className='flex flex-wrap items-center gap-3'>
              <SubmitButton label='Update Testimoni' />
              <FormFeedback state={updateState} />
            </div>
          </form>

          <form action={deleteAction} className='mt-3 border-t border-slate-200 pt-3'>
            <input type='hidden' name='testimonial_id' value={testimonial.id} />
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <p className='text-xs text-slate-500'>
                Testimoni ini akan dihapus permanen dari database.
              </p>
              <button
                type='submit'
                className='inline-flex items-center rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100'
              >
                Hapus Testimoni
              </button>
            </div>
            <div className='mt-2'>
              <FormFeedback state={deleteState} />
            </div>
          </form>
        </div>
      )}
    </Draggable>
  );
}

export default function TestimonialSection({ testimonials = [] }) {
  const router = useRouter();
  const createFormRef = useRef(null);
  const [reorderState, setReorderState] = useState(INITIAL_STATE);
  const [isReordering, startReordering] = useTransition();
  const [createState, createAction] = useActionState(
    addTestimonialAction,
    INITIAL_STATE,
  );

  useEffect(() => {
    if (!createState?.ok) return;
    createFormRef.current?.reset();
    router.refresh();
  }, [createState?.ok, router]);

  const sortedTestimonials = useMemo(
    () => sortTestimonials(Array.isArray(testimonials) ? testimonials : []),
    [testimonials],
  );
  const [orderedTestimonials, setOrderedTestimonials] = useState(sortedTestimonials);

  useEffect(() => {
    setOrderedTestimonials(sortedTestimonials);
  }, [sortedTestimonials]);

  function handleItemSuccess() {
    router.refresh();
  }

  function handleDragEnd(result) {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;

    const previous = orderedTestimonials;
    const next = reorderItems(orderedTestimonials, source.index, destination.index);
    setOrderedTestimonials(next);

    startReordering(async () => {
      const payload = next.map((item) => Number(item.id));
      const response = await reorderTestimonialsAction(payload);
      setReorderState(response || INITIAL_STATE);

      if (!response?.ok) {
        setOrderedTestimonials(previous);
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className='space-y-4'>
      <form
        ref={createFormRef}
        action={createAction}
        className='space-y-4 rounded-xl border border-slate-200 bg-white p-4'
      >
        <div>
          <h4 className='text-sm font-semibold text-slate-900'>Testimoni</h4>
          <p className='text-xs text-slate-500'>
            Kelola data testimoni untuk section homepage.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-3 lg:grid-cols-2'>
          <Input
            label='Nama Klien'
            name='testimonial_client_name'
            placeholder='Contoh: Budi Santoso'
            required
          />
          <Input
            label='Judul'
            name='testimonial_title'
            placeholder='Contoh: Produksi cepat dan rapi'
            required
          />
        </div>

        <Textarea
          label='Isi Testimoni'
          name='testimonial_quote'
          rows={4}
          placeholder='Tulis testimoni di sini...'
          required
        />

        <div className='grid grid-cols-1 gap-3 sm:grid-cols-2'>
          <Input
            label='Link (Opsional)'
            name='testimonial_link_url'
            placeholder='https://...'
          />
          <Input
            label='Rating (1-5)'
            name='testimonial_rating'
            type='number'
            min={1}
            max={5}
            defaultValue={5}
            required
          />
        </div>

        <label className='inline-flex items-center gap-2 text-sm font-medium text-slate-700'>
          <input
            type='checkbox'
            name='testimonial_is_active'
            value='1'
            defaultChecked
            className='h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500'
          />
          Tampilkan di homepage
        </label>

        <div className='flex flex-wrap items-center gap-3'>
          <SubmitButton label='Tambah Testimoni' />
          <FormFeedback state={createState} />
        </div>
      </form>

      <div className='rounded-xl border border-slate-200 bg-white p-4'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3'>
          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
            Daftar Testimoni
          </p>
          <p className='text-xs text-slate-500'>
            {isReordering
              ? "Menyimpan urutan..."
              : "Geser kartu untuk mengubah sort order."}
          </p>
        </div>

        {orderedTestimonials.length === 0 ? (
          <p className='mt-3 text-sm text-slate-500'>Belum ada data testimoni.</p>
        ) : (
          <div className='mt-3'>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId='testimonial-droppable'>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className='space-y-3'
                  >
                    {orderedTestimonials.map((testimonial, index) => (
                      <TestimonialItemCard
                        key={testimonial.id}
                        testimonial={testimonial}
                        index={index}
                        onSuccess={handleItemSuccess}
                      />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </div>
        )}

        <div className='mt-3'>
          <FormFeedback state={reorderState} />
        </div>
      </div>
    </div>
  );
}
