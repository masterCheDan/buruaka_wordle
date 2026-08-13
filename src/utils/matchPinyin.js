import pinyin from 'pinyin'

export default function matchPinyin(query, name) {
    if (!query || !name || typeof name !== 'string') return false

    query = query.toLowerCase()

    let pyArray = []
    try {
        pyArray = pinyin(name, {
            style: pinyin.STYLE_NORMAL
        }).flat()
    } catch (e) {
        return false
    }

    const fullPinyin = pyArray.join('').toLowerCase()
    const firstLetters = pyArray.map(p => p[0]).join('').toLowerCase()

    return (
        name.includes(query) ||
        fullPinyin.includes(query) ||
        firstLetters.includes(query)
    )
}
