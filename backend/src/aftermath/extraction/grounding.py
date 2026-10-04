from aftermath.extraction.schemas import RawSourceSpan


class UngroundedSpanError(Exception):
    """Raised when an extracted span cannot be verified in the source text."""

    pass


class GroundingGate:
    """Verifies that an extracted fact traces back to verbatim characters in the source document."""

    @staticmethod
    def verify_span(page_text: str, span: RawSourceSpan, tolerance_chars: int = 10) -> bool:
        """Verifies that span.verbatim_text exists at [char_start:char_end] on page_text.

        Returns True if grounded, raises UngroundedSpanError otherwise.
        """
        text_len = len(page_text)
        if span.char_start < 0 or span.char_end > text_len or span.char_start >= span.char_end:
            raise UngroundedSpanError(
                f"Span offsets [{span.char_start}:{span.char_end}] are out of document page bounds (0 to {text_len})."
            )

        # 1. Exact slice equality
        slice_text = page_text[span.char_start : span.char_end]
        if slice_text == span.verbatim_text:
            return True

        # 2. Whitespace-normalized slice equality
        norm_slice = " ".join(slice_text.split())
        norm_target = " ".join(span.verbatim_text.split())
        if norm_slice == norm_target:
            return True

        # 3. Local window search (within tolerance_chars to account for slight boundary shift)
        window_start = max(0, span.char_start - tolerance_chars)
        window_end = min(text_len, span.char_end + tolerance_chars)
        window_text = page_text[window_start:window_end]

        if span.verbatim_text in window_text or norm_target in " ".join(window_text.split()):
            return True

        raise UngroundedSpanError(
            f"Grounding failed: verbatim text '{span.verbatim_text[:30]}...' not found at offsets "
            f"[{span.char_start}:{span.char_end}]. Found instead: '{slice_text[:30]}...'."
        )

    @classmethod
    def evaluate_grounding(
        cls, page_text: str, span: RawSourceSpan, tolerance_chars: int = 10
    ) -> str:
        """Evaluates grounding and returns 'VERIFIED' if grounded, or 'REJECTED_UNGROUNDED' if ungrounded."""
        try:
            cls.verify_span(page_text, span, tolerance_chars)
            return "VERIFIED"
        except UngroundedSpanError:
            return "REJECTED_UNGROUNDED"
