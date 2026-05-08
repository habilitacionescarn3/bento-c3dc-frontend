import React, { useRef, useState, useCallback } from 'react';
import histogramChartTitleHandle from '../../../assets/icons/histogramChartTitleHandle.svg';
import { useDispatch, useSelector } from 'react-redux';
import { setTopRowPanelOrder, promoteBesideStripLayout } from '../store/cohortAnalyzerLayoutActions';
import { buildStripOrderPromotingBeside } from '../store/besideStripPromotion';
import {
    encodePanelDragPayload,
    parseDragDataTransfer,
    CA_PANEL_DRAG_MIME,
} from '../store/panelDnD';

/**
 * Drag-and-drop between Venn and survival panels beside each other, and drops from histogram strip.
 */
export function useBesidePanelDnD(panelDragHandlesEnabled) {
    const dispatch = useDispatch();
    const topRowOrder = useSelector((s) => s.cohortAnalyzerLayout.topRowOrder);
    const survivalBesideFromSelection = useSelector(
        (s) => s.cohortAnalyzerLayout.uiFlags.survivalBesideFromSelection,
    );
    const stripOrder = useSelector((s) => s.cohortAnalyzerLayout.stripOrder);

    const survivalBesideTopRowUsesOrder = survivalBesideFromSelection;

    const besidePanelDraggingRef = useRef(null);
    const besideDragSessionRef = useRef(0);
    const [besidePanelDragging, setBesidePanelDragging] = useState(null);
    const [besideDropTarget, setBesideDropTarget] = useState(null);

    const besideColumnDropTargetStyle =
        besideDropTarget && besidePanelDragging && besidePanelDragging.kind !== besideDropTarget
            ? {
                outline: '2px solid #679AAA',
                outlineOffset: 4,
                borderRadius: 10,
                transition: 'outline 0.12s ease',
            }
            : undefined;

    const beginBesidePanelDrag = useCallback((panelId, dims) => {
        besideDragSessionRef.current += 1;
        const session = besideDragSessionRef.current;
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                if (besideDragSessionRef.current !== session) return;
                setBesidePanelDragging({ kind: panelId, width: dims.width, height: dims.height });
            });
        });
    }, []);

    const endBesidePanelDrag = useCallback(() => {
        besideDragSessionRef.current += 1;
        besidePanelDraggingRef.current = null;
        setBesidePanelDragging(null);
        setBesideDropTarget(null);
    }, []);

    const handleBesidePanelDragStart = useCallback((e, panelId) => {
        const payload = encodePanelDragPayload({ kind: panelId, dataset: null });
        e.dataTransfer.setData(CA_PANEL_DRAG_MIME, payload);
        e.dataTransfer.setData('text/plain', panelId);
        e.dataTransfer.effectAllowed = 'move';
        let w = 400;
        let h = 380;
        if (typeof document !== 'undefined') {
            const domId = panelId === 'venn' ? 'cohort-analyzer-venn-card' : 'cohort-analyzer-survival-beside-card';
            const el = document.getElementById(domId);
            if (el && typeof el.getBoundingClientRect === 'function') {
                const r = el.getBoundingClientRect();
                w = Math.round(r.width);
                h = Math.round(r.height);
                e.dataTransfer.setDragImage(el, 32, 20);
            }
        }
        const dragState = { kind: panelId, width: w, height: h };
        besidePanelDraggingRef.current = dragState;
        beginBesidePanelDrag(panelId, { width: w, height: h });
    }, [beginBesidePanelDrag]);

    const handleBesidePanelDragEnd = useCallback(() => {
        endBesidePanelDrag();
    }, [endBesidePanelDrag]);

    const handleBesidePanelDragOver = useCallback((e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleBesideColumnDragOver = useCallback(
        (columnId) => (e) => {
            handleBesidePanelDragOver(e);
            const d = besidePanelDraggingRef.current;
            if (!d) return;
            if (d.kind === columnId) {
                setBesideDropTarget(null);
                return;
            }
            setBesideDropTarget(columnId);
        },
        [handleBesidePanelDragOver],
    );

    const handleBesideRowDragLeave = useCallback((e) => {
        if (!besidePanelDraggingRef.current) return;
        const rel = e.relatedTarget;
        if (rel && e.currentTarget.contains(rel)) return;
        setBesideDropTarget(null);
    }, []);

    const promoteHistogramToBesideSlot = useCallback(
        (dataset) => {
            const mergedVisible = Array.from(new Set([...stripOrder, dataset]));
            const order = buildStripOrderPromotingBeside(stripOrder, mergedVisible, dataset);
            if (!order) return;
            dispatch(promoteBesideStripLayout({ stripOrder: order, besideStripPanelId: dataset }));
        },
        [dispatch, stripOrder],
    );

    const handleBesidePanelDrop = useCallback(
        (targetPanelId) => (e) => {
            e.preventDefault();
            e.stopPropagation();
            const parsed = parseDragDataTransfer(e.dataTransfer);
            if (!parsed) return;

            if (parsed.kind === 'histogram' && parsed.dataset) {
                promoteHistogramToBesideSlot(parsed.dataset);
                return;
            }

            const from = parsed.kind === 'venn' || parsed.kind === 'survival' ? parsed.kind : null;
            if (from && (from === 'venn' || from === 'survival') && from !== targetPanelId) {
                const order = [...topRowOrder];
                const i = order.indexOf(from);
                const j = order.indexOf(targetPanelId);
                if (i < 0 || j < 0) return;
                const tmp = order[i];
                order[i] = order[j];
                order[j] = tmp;
                dispatch(setTopRowPanelOrder(order));
            }
        },
        [dispatch, topRowOrder, promoteHistogramToBesideSlot],
    );

    const vennHeaderGrab = (
        <span
            aria-hidden={!panelDragHandlesEnabled}
            title={
              panelDragHandlesEnabled
                ? 'Drag to swap with survival chart or drop on a histogram card to link it beside this row'
                : undefined
            }
            style={{
                display: 'inline-flex',
                alignItems: 'center',
                alignSelf: 'center',
                marginRight: 6,
                cursor: panelDragHandlesEnabled ? 'grab' : 'default',
                opacity: panelDragHandlesEnabled ? 1 : 0.55,
            }}
        >
            <img
                src={histogramChartTitleHandle}
                alt=""
                width={14}
                height={15}
                aria-hidden
                style={{ display: 'block', flexShrink: 0 }}
            />
        </span>
    );

    const vennBesideDrag = panelDragHandlesEnabled
        ? {
            id: 'cohort-analyzer-venn-card',
            draggable: true,
            onDragStart: (e) => handleBesidePanelDragStart(e, 'venn'),
            onDragEnd: handleBesidePanelDragEnd,
        }
        : undefined;

    const survivalBesideDrag = panelDragHandlesEnabled
        ? {
            id: 'cohort-analyzer-survival-beside-card',
            draggable: true,
            onDragStart: (e) => handleBesidePanelDragStart(e, 'survival'),
            onDragEnd: handleBesidePanelDragEnd,
        }
        : undefined;

    return {
        survivalBesideTopRowUsesOrder,
        besidePanelDragging,
        besidePanelDraggingRef,
        besideDropTarget,
        besideColumnDropTargetStyle,
        handleBesideRowDragLeave,
        handleBesideColumnDragOver,
        handleBesidePanelDrop,
        handleBesidePanelDragOver,
        vennHeaderGrab,
        vennBesideDrag,
        survivalBesideDrag,
        /** Call after a top-row (Venn/survival) drag is dropped on the histogram strip so ghost state clears. */
        endBesidePanelDrag,
    };
}
