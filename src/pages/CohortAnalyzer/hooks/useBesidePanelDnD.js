import React, { useRef, useState, useCallback } from 'react';
import histogramChartTitleHandle from '../../../assets/icons/histogramChartTitleHandle.svg';
import { useDispatch, useSelector } from 'react-redux';
import { setTopRowPanelOrder, setBesideStripPanelId, setStripOrder } from '../store/cohortAnalyzerLayoutActions';
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

    const handleBesidePanelDragStart = useCallback((e, panelId) => {
        const payload = encodePanelDragPayload({ kind: panelId, dataset: null });
        e.dataTransfer.setData(CA_PANEL_DRAG_MIME, payload);
        e.dataTransfer.setData('text/plain', panelId);
        e.dataTransfer.effectAllowed = 'move';
        if (typeof document === 'undefined') return;
        const domId = panelId === 'venn' ? 'cohort-analyzer-venn-card' : 'cohort-analyzer-survival-beside-card';
        const el = document.getElementById(domId);
        if (el && typeof el.getBoundingClientRect === 'function') {
            const r = el.getBoundingClientRect();
            const dragState = {
                kind: panelId,
                width: Math.round(r.width),
                height: Math.round(r.height),
            };
            besidePanelDraggingRef.current = dragState;
            setBesidePanelDragging(dragState);
            e.dataTransfer.setDragImage(el, 32, 20);
        } else {
            const dragState = { kind: panelId, width: 400, height: 380 };
            besidePanelDraggingRef.current = dragState;
            setBesidePanelDragging(dragState);
        }
    }, []);

    const handleBesidePanelDragEnd = useCallback(() => {
        besidePanelDraggingRef.current = null;
        setBesidePanelDragging(null);
        setBesideDropTarget(null);
    }, []);

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
            if (!dataset || dataset === 'survivalAnalysis') return;
            const order = [...stripOrder];
            if (order.length > 0) {
                const idx = order.indexOf(dataset);
                if (idx >= 0) {
                    order.splice(idx, 1);
                    order.unshift(dataset);
                    dispatch(setStripOrder(order));
                }
            }
            dispatch(setBesideStripPanelId(dataset));
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
                if (!survivalBesideFromSelection) {
                    promoteHistogramToBesideSlot(parsed.dataset);
                }
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
        [dispatch, topRowOrder, survivalBesideFromSelection, promoteHistogramToBesideSlot],
    );

    const vennHeaderGrab = (
        <span
            aria-hidden={!panelDragHandlesEnabled}
            title={panelDragHandlesEnabled ? 'Drag to swap position with survival chart' : undefined}
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
        besideDropTarget,
        besideColumnDropTargetStyle,
        handleBesideRowDragLeave,
        handleBesideColumnDragOver,
        handleBesidePanelDrop,
        handleBesidePanelDragOver,
        vennHeaderGrab,
        vennBesideDrag,
        survivalBesideDrag,
    };
}
