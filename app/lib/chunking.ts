export type DocumentChunk = {
    content: string
    metadata: Record<string, unknown>
    chunkIndex: number
}

const DEFAULT_CHUNK_SIZE = 800
const DEFAULT_CHUNK_OVERLAP = 200

/**
 * Split text into overlapping chunks for embedding.
 * Splits on paragraph boundaries first, then sentence boundaries,
 * falling back to character-level splitting.
 */
export function chunkText(
    text: string,
    options?: { chunkSize?: number; chunkOverlap?: number; metadata?: Record<string, unknown> }
): DocumentChunk[] {
    const chunkSize = options?.chunkSize ?? DEFAULT_CHUNK_SIZE
    const chunkOverlap = options?.chunkOverlap ?? DEFAULT_CHUNK_OVERLAP
    const baseMetadata = options?.metadata ?? {}

    const cleaned = text.replace(/\r\n/g, '\n').trim()
    if (!cleaned) return []

    // Split into paragraphs
    const paragraphs = cleaned.split(/\n\s*\n/).filter((p) => p.trim().length > 0)

    const chunks: DocumentChunk[] = []
    let currentChunk = ''
    let chunkIndex = 0

    for (const paragraph of paragraphs) {
        const trimmed = paragraph.trim()

        // If adding this paragraph exceeds chunk size, finalize current chunk
        if (currentChunk && (currentChunk.length + trimmed.length + 2) > chunkSize) {
            chunks.push({
                content: currentChunk.trim(),
                metadata: { ...baseMetadata, chunkIndex },
                chunkIndex,
            })
            chunkIndex++

            // Keep overlap from end of current chunk
            if (chunkOverlap > 0 && currentChunk.length > chunkOverlap) {
                currentChunk = currentChunk.slice(-chunkOverlap) + '\n\n' + trimmed
            } else {
                currentChunk = trimmed
            }
        } else {
            currentChunk = currentChunk ? currentChunk + '\n\n' + trimmed : trimmed
        }

        // Handle very long paragraphs that exceed chunk size on their own
        while (currentChunk.length > chunkSize) {
            const splitPoint = findSplitPoint(currentChunk, chunkSize)
            chunks.push({
                content: currentChunk.slice(0, splitPoint).trim(),
                metadata: { ...baseMetadata, chunkIndex },
                chunkIndex,
            })
            chunkIndex++

            const overlapStart = Math.max(0, splitPoint - chunkOverlap)
            currentChunk = currentChunk.slice(overlapStart)
        }
    }

    // Push remaining text
    if (currentChunk.trim()) {
        chunks.push({
            content: currentChunk.trim(),
            metadata: { ...baseMetadata, chunkIndex },
            chunkIndex,
        })
    }

    return chunks
}

/**
 * Find the best split point near the target position.
 * Prefers splitting at sentence boundaries, then word boundaries.
 */
function findSplitPoint(text: string, target: number): number {
    // Look for sentence boundary near target
    const sentenceEnd = text.lastIndexOf('. ', target)
    if (sentenceEnd > target * 0.5) return sentenceEnd + 2

    const questionEnd = text.lastIndexOf('? ', target)
    if (questionEnd > target * 0.5) return questionEnd + 2

    const exclamEnd = text.lastIndexOf('! ', target)
    if (exclamEnd > target * 0.5) return exclamEnd + 2

    // Fall back to word boundary
    const spacePos = text.lastIndexOf(' ', target)
    if (spacePos > target * 0.3) return spacePos + 1

    // Worst case: hard split
    return target
}
