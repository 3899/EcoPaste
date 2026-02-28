import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { writeText } from "tauri-plugin-clipboard-x-api";
import { paste } from "@/plugins/paste";
import { hideWindow } from "@/plugins/window";

interface Position {
	top: number;
	left: number;
}

interface SelectionToolbarProps {
	containerRef: React.RefObject<HTMLDivElement | null>;
}

const TOOLBAR_OFFSET = 9;

const SelectionToolbar = ({ containerRef }: SelectionToolbarProps) => {
	const { t } = useTranslation();
	const [visible, setVisible] = useState(false);
	const [position, setPosition] = useState<Position>({ top: 0, left: 0 });
	const toolbarRef = useRef<HTMLDivElement>(null);
	const isClickingToolbar = useRef(false);

	// 检查选区是否在当前容器内
	const isSelectionInContainer = () => {
		const selection = window.getSelection();
		if (!selection || selection.isCollapsed || !containerRef.current) return false;

		const anchorNode = selection.anchorNode;
		const focusNode = selection.focusNode;
		if (!anchorNode || !focusNode) return false;

		return (
			containerRef.current.contains(anchorNode) &&
			containerRef.current.contains(focusNode)
		);
	};

	// 两阶段定位：先渲染获取尺寸，再精确定位
	useLayoutEffect(() => {
		if (!visible || !toolbarRef.current) return;

		const selection = window.getSelection();
		if (!selection || selection.isCollapsed) return;

		const range = selection.getRangeAt(0);
		const rect = range.getBoundingClientRect();
		const tw = toolbarRef.current.offsetWidth;
		const th = toolbarRef.current.offsetHeight;

		let top = rect.bottom + TOOLBAR_OFFSET;
		let left = rect.left + rect.width / 2;

		// 水平裁剪：确保不超出可视区域
		const minLeft = tw / 2 + 4;
		const maxLeft = window.innerWidth - tw / 2 - 4;
		left = Math.max(minLeft, Math.min(left, maxLeft));

		// 垂直裁剪：下方空间不够时放到上方
		if (top + th > window.innerHeight - 4) {
			top = rect.top - th - TOOLBAR_OFFSET;
		}
		// 上方也不够时，贴顶
		if (top < 4) {
			top = 4;
		}

		setPosition({ top, left });
	}, [visible]);

	useEffect(() => {
		const handleMouseUp = (e: MouseEvent) => {
			// 右键不触发工具栏，由 contextmenu 事件处理
			if (e.button === 2) return;

			if (isClickingToolbar.current) {
				isClickingToolbar.current = false;
				return;
			}

			requestAnimationFrame(() => {
				if (!isSelectionInContainer()) {
					setVisible(false);
					return;
				}

				const selection = window.getSelection();
				const text = selection?.toString().trim();
				if (!text) {
					setVisible(false);
					return;
				}

				// 先设置一个粗略位置，visible 触发后 useLayoutEffect 重新精确定位
				const range = selection!.getRangeAt(0);
				const rect = range.getBoundingClientRect();
				setPosition({
					top: rect.bottom + TOOLBAR_OFFSET,
					left: rect.left + rect.width / 2,
				});
				setVisible(true);
			});
		};

		const handleMouseDown = () => {
			if (isClickingToolbar.current) return;
			setVisible(false);
		};

		const handleScroll = () => {
			setVisible(false);
			window.getSelection()?.removeAllRanges();
		};

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setVisible(false);
				window.getSelection()?.removeAllRanges();
			}
		};

		const handleVisibilityChange = () => {
			if (document.hidden) {
				setVisible(false);
				window.getSelection()?.removeAllRanges();
			}
		};

		const handleWindowBlur = () => {
			setVisible(false);
			window.getSelection()?.removeAllRanges();
		};

		// 右键时隐藏工具栏，避免与右键菜单重叠
		const handleContextMenu = () => {
			setVisible(false);
		};

		document.addEventListener("mouseup", handleMouseUp);
		document.addEventListener("mousedown", handleMouseDown);
		document.addEventListener("scroll", handleScroll, true);
		document.addEventListener("keydown", handleKeyDown);
		document.addEventListener("visibilitychange", handleVisibilityChange);
		document.addEventListener("contextmenu", handleContextMenu);
		window.addEventListener("blur", handleWindowBlur);

		return () => {
			document.removeEventListener("mouseup", handleMouseUp);
			document.removeEventListener("mousedown", handleMouseDown);
			document.removeEventListener("scroll", handleScroll, true);
			document.removeEventListener("keydown", handleKeyDown);
			document.removeEventListener("visibilitychange", handleVisibilityChange);
			document.removeEventListener("contextmenu", handleContextMenu);
			window.removeEventListener("blur", handleWindowBlur);
		};
	}, []);

	const getSelectedText = () => {
		return window.getSelection()?.toString().trim() || "";
	};

	const clearSelection = () => {
		window.getSelection()?.removeAllRanges();
		setVisible(false);
	};

	const handleCopy = (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		isClickingToolbar.current = true;

		const text = getSelectedText();
		if (text) writeText(text);
		clearSelection();
	};

	const handlePaste = async (e: React.MouseEvent) => {
		e.preventDefault();
		e.stopPropagation();
		isClickingToolbar.current = true;

		const text = getSelectedText();
		if (text) {
			await writeText(text);
			clearSelection();
			hideWindow();
			await paste();
		} else {
			clearSelection();
		}
	};

	if (!visible) return null;

	const btnClass =
		"cursor-pointer whitespace-nowrap px-3 py-1.5 text-xs transition b-none bg-transparent text-color-1 hover:bg-primary-1 hover:text-primary active:bg-primary-2";

	return (
		<div
			ref={toolbarRef}
			className="fixed z-9999 flex min-w-[72px] flex-col overflow-hidden rounded-md b b-color-2 bg-white shadow-md dark:bg-[#2a2a2a]"
			style={{
				top: position.top,
				left: position.left,
				transform: "translateX(-50%)",
			}}
			onMouseDown={(e) => {
				e.preventDefault();
				e.stopPropagation();
				isClickingToolbar.current = true;
			}}
		>
			<button className={btnClass} onClick={handleCopy} type="button">
				{t("clipboard.button.context_menu.copy")}
			</button>

			<div className="mx-1 h-px bg-color-3" />

			<button className={btnClass} onClick={handlePaste} type="button">
				{t("clipboard.button.context_menu.paste")}
			</button>
		</div>
	);
};

export default SelectionToolbar;
