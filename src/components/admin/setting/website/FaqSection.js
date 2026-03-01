"use client";

import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { DragDropContext, Draggable, Droppable } from "@hello-pangea/dnd";
import { useRouter } from "next/navigation";
import {
  addFaqAction,
  deleteFaqAction,
  reorderFaqsAction,
  updateFaqAction,
} from "@/actions/faq";
import {
  FormFeedback,
  INITIAL_STATE,
  Input,
  SubmitButton,
  Textarea,
} from "../ui";
import { FiHelpCircle, FiMoreVertical, FiTrash2 } from "react-icons/fi";

function sortFaqs(items) {
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

function FaqItemCard({ faq, index, onSuccess }) {
  const [updateState, updateAction] = useActionState(updateFaqAction, INITIAL_STATE);
  const [deleteState, deleteAction] = useActionState(deleteFaqAction, INITIAL_STATE);

  useEffect(() => {
    if (!updateState?.ok && !deleteState?.ok) return;
    onSuccess();
  }, [deleteState?.ok, onSuccess, updateState?.ok]);

  return (
    <Draggable draggableId={`faq-${faq.id}`} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          className={`rounded-xl border bg-white p-4 transition ${
            snapshot.isDragging
              ? "border-blue-300 shadow-lg ring-2 ring-blue-100"
              : "border-slate-200"
          }`}
        >
          <div className='mb-3 flex items-start justify-between gap-3'>
            <p className='inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500'>
              <FiHelpCircle className='h-4 w-4' />
              FAQ #{index + 1}
            </p>
            <button
              type='button'
              {...provided.dragHandleProps}
              className='inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700'
              aria-label='Geser urutan FAQ'
              title='Geser urutan FAQ'
            >
              <FiMoreVertical className='h-4 w-4' />
            </button>
          </div>

          <form action={updateAction} className='space-y-3'>
            <input type='hidden' name='faq_id' value={faq.id} />
            <Input
              label='Pertanyaan'
              name='faq_question'
              defaultValue={faq.question}
              required
            />
            <Textarea
              label='Jawaban'
              name='faq_answer'
              defaultValue={faq.answer}
              rows={4}
              required
            />

            <label className='inline-flex items-center gap-2 text-sm font-medium text-slate-700'>
              <input
                type='checkbox'
                name='faq_is_active'
                value='1'
                defaultChecked={faq.is_active}
                className='h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500'
              />
              Tampilkan di homepage
            </label>

            <div className='flex flex-wrap items-center gap-3'>
              <SubmitButton label='Update FAQ' />
              <FormFeedback state={updateState} />
            </div>
          </form>

          <form action={deleteAction} className='mt-3 border-t border-slate-200 pt-3'>
            <input type='hidden' name='faq_id' value={faq.id} />
            <div className='flex flex-wrap items-center justify-between gap-3'>
              <p className='text-xs text-slate-500'>
                FAQ ini akan dihapus permanen dari database.
              </p>
              <button
                type='submit'
                className='inline-flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100'
              >
                <FiTrash2 className='h-4 w-4' />
                Hapus FAQ
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

export default function FaqSection({ faqs = [] }) {
  const router = useRouter();
  const [createState, createAction] = useActionState(addFaqAction, INITIAL_STATE);
  const [reorderState, setReorderState] = useState(INITIAL_STATE);
  const [isReordering, startReordering] = useTransition();
  const createFormRef = useRef(null);

  const sortedFaqs = useMemo(() => sortFaqs(Array.isArray(faqs) ? faqs : []), [faqs]);
  const [orderedFaqs, setOrderedFaqs] = useState(sortedFaqs);

  useEffect(() => {
    setOrderedFaqs(sortedFaqs);
  }, [sortedFaqs]);

  useEffect(() => {
    if (!createState?.ok) return;
    createFormRef.current?.reset();
    router.refresh();
  }, [createState?.ok, router]);

  function handleItemSuccess() {
    router.refresh();
  }

  function handleDragEnd(result) {
    const { source, destination } = result;
    if (!destination) return;
    if (source.index === destination.index) return;

    const previous = orderedFaqs;
    const next = reorderItems(orderedFaqs, source.index, destination.index);
    setOrderedFaqs(next);

    startReordering(async () => {
      const payload = next.map((item) => Number(item.id));
      const response = await reorderFaqsAction(payload);
      setReorderState(response || INITIAL_STATE);

      if (!response?.ok) {
        setOrderedFaqs(previous);
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
          <h4 className='text-sm font-semibold text-slate-900'>FAQ</h4>
          <p className='text-xs text-slate-500'>
            Kelola pertanyaan, jawaban, status tampil, dan urutan FAQ dengan drag and drop.
          </p>
        </div>

        <div className='grid grid-cols-1 gap-3'>
          <Input
            label='Pertanyaan'
            name='faq_question'
            placeholder='Contoh: Berapa minimum order?'
            required
          />
          <Textarea
            label='Jawaban'
            name='faq_answer'
            rows={4}
            placeholder='Tulis jawaban FAQ di sini...'
            required
          />
        </div>

        <label className='inline-flex items-center gap-2 text-sm font-medium text-slate-700'>
          <input
            type='checkbox'
            name='faq_is_active'
            value='1'
            defaultChecked
            className='h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500'
          />
          Tampilkan di homepage
        </label>

        <div className='flex flex-wrap items-center gap-3'>
          <SubmitButton label='Tambah FAQ' />
          <FormFeedback state={createState} />
        </div>
      </form>

      <div className='rounded-xl border border-slate-200 bg-white p-4'>
        <div className='flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3'>
          <p className='text-xs font-semibold uppercase tracking-wide text-slate-500'>
            Daftar FAQ
          </p>
          <p className='text-xs text-slate-500'>
            {isReordering ? "Menyimpan urutan..." : "Geser kartu untuk mengubah urutan."}
          </p>
        </div>

        {orderedFaqs.length === 0 ? (
          <p className='mt-3 text-sm text-slate-500'>Belum ada data FAQ.</p>
        ) : (
          <div className='mt-3'>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId='faq-droppable'>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className='space-y-3'
                  >
                    {orderedFaqs.map((faq, index) => (
                      <FaqItemCard
                        key={faq.id}
                        faq={faq}
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
