export interface Hexagram {
  number: number
  name: string
  chineseName: string
  subtitle: string
  rating: string
  image: string
  description: string
  upperTrigram: string
  lowerTrigram: string
}

// Trigram lookup: [line1-bottom, line2-middle, line3-top] where 0=yin, 1=yang
// trigram names: Heaven(乾), Earth(坤), Thunder(震), Water(坎), Mountain(艮), Wind(巽), Fire(离), Lake(兑)
const TRIGRAM_MAP: Record<string, string> = {
  '111': 'Heaven',
  '000': 'Earth',
  '100': 'Thunder',
  '010': 'Water',
  '001': 'Mountain',
  '011': 'Wind',
  '101': 'Fire',
  '110': 'Lake',
}

// King Wen sequence lookup: [lowerTrigram][upperTrigram] -> hexagram number
const HEXAGRAM_LOOKUP: Record<string, Record<string, number>> = {
  Heaven: {
    Heaven: 1,
    Earth: 11,
    Thunder: 34,
    Water: 5,
    Mountain: 26,
    Wind: 9,
    Fire: 14,
    Lake: 43,
  },
  Earth: {
    Heaven: 12,
    Earth: 2,
    Thunder: 16,
    Water: 7,
    Mountain: 15,
    Wind: 46,
    Fire: 35,
    Lake: 45,
  },
  Thunder: {
    Heaven: 25,
    Earth: 24,
    Thunder: 51,
    Water: 3,
    Mountain: 27,
    Wind: 42,
    Fire: 21,
    Lake: 17,
  },
  Water: {
    Heaven: 6,
    Earth: 8,
    Thunder: 40,
    Water: 29,
    Mountain: 39,
    Wind: 59,
    Fire: 64,
    Lake: 47,
  },
  Mountain: {
    Heaven: 33,
    Earth: 23,
    Thunder: 62,
    Water: 4,
    Mountain: 52,
    Wind: 53,
    Fire: 56,
    Lake: 31,
  },
  Wind: {
    Heaven: 44,
    Earth: 20,
    Thunder: 32,
    Water: 48,
    Mountain: 18,
    Wind: 57,
    Fire: 50,
    Lake: 28,
  },
  Fire: {
    Heaven: 13,
    Earth: 36,
    Thunder: 55,
    Water: 63,
    Mountain: 22,
    Wind: 37,
    Fire: 30,
    Lake: 49,
  },
  Lake: {
    Heaven: 10,
    Earth: 19,
    Thunder: 54,
    Water: 60,
    Mountain: 41,
    Wind: 61,
    Fire: 38,
    Lake: 58,
  },
}

export const HEXAGRAMS: Hexagram[] = [
  {
    number: 1,
    name: 'Qian',
    chineseName: '乾',
    subtitle: 'The Creative - Strength and Persistence',
    rating: 'Highly Auspicious',
    upperTrigram: 'Heaven',
    lowerTrigram: 'Heaven',
    image:
      'A dragon that has long been trapped finds water at last — fortune has turned. Smiles rise to the brow unbidden; all plans proceed as desired, and prosperity steadily grows.',
    description:
      'This hexagram is formed by doubling the trigram Heaven (Qian). It symbolizes the sky and the dragon — a metaphor for the virtuous and talented person. It represents pure yang energy and robust vitality. The I Ching uses "yuan, heng, li, zhen" (originating, penetrating, advantageous, persevering) as its core message, signifying great fortune and urging one to follow the way of Heaven with integrity.',
  },
  {
    number: 2,
    name: 'Kun',
    chineseName: '坤',
    subtitle: 'The Receptive - Nurturing Virtue',
    rating: 'Highly Auspicious',
    upperTrigram: 'Earth',
    lowerTrigram: 'Earth',
    image:
      'A plump sheep strays from the flock onto a mountain ridge, where a hungry tiger opens its jaws. Its appetite is satisfied and its heart rejoices — if this hexagram is drawn, great fortune abounds.',
    description:
      'This hexagram doubles Earth (Kun), representing pure yin. It symbolizes the earth — receptive, nurturing, and infinite in its generosity. Like a gentle mare, it embodies the earth\'s capacity to support all things while remaining obedient to heaven and time. "First confusion, then gain" illustrates that by following the creative (Qian), one finds the right direction and achieves good fortune.',
  },
  {
    number: 3,
    name: 'Zhun',
    chineseName: '屯',
    subtitle: 'Difficulty at the Beginning',
    rating: 'Challenging',
    upperTrigram: 'Water',
    lowerTrigram: 'Thunder',
    image:
      'Wind tangles loose threads into knots impossible to untangle. Turned upside-down and confused, one is mired in worry. Be patient and move slowly — haste only brings less freedom.',
    description:
      'Thunder below, Water above — movement meets danger. Thunder stirs and rain threatens; peril is everywhere. "Zhun" originally means a sprout pushing through the earth. All new beginnings are fraught with hardship and obstacles, yet by moving in accord with the times, vigorous growth is inevitable.',
  },
  {
    number: 4,
    name: 'Meng',
    chineseName: '蒙',
    subtitle: 'Youthful Folly - Seeking Enlightenment',
    rating: 'Moderate Challenge',
    upperTrigram: 'Mountain',
    lowerTrigram: 'Water',
    image:
      'The lines of this hexagram portend minor losses. Fortune does not run high for the noble seeker. Marriage and partnerships bring petty annoyances, and endeavors inevitably entail toil.',
    description:
      'Water below, Mountain above. The mountain looms while danger lies beneath, yet one does not stop advancing — this is the state of inexperience (Meng). By seizing the right moment and acting wisely, this hexagram carries the promise of enlightenment and breakthrough.',
  },
  {
    number: 5,
    name: 'Xu',
    chineseName: '需',
    subtitle: 'Waiting - Patient Readiness',
    rating: 'Favorable',
    upperTrigram: 'Water',
    lowerTrigram: 'Heaven',
    image:
      'A bright pearl buried deep in soil, without light or luster until now — suddenly a great wind blows the earth away, and the gem reveals itself anew.',
    description:
      'Heaven below, Water above. Firm strength meets perilous depths. Meeting danger with determination, one should remain steady and not act rashly. Observe the changing tides and wait; success will surely come.',
  },
  {
    number: 6,
    name: 'Song',
    chineseName: '讼',
    subtitle: 'Conflict - Caution in Disputes',
    rating: 'Moderate Challenge',
    upperTrigram: 'Heaven',
    lowerTrigram: 'Water',
    image:
      'Troubled thoughts make every task harder. It is as if two people argue over one path — both insist on going first, yet neither will yield a single step.',
    description:
      'Water below, Heaven above. Strength clashes with danger; rigidity meets peril. Opposition inevitably breeds conflict. Disputes are never good things — one must proceed with the utmost caution and wariness.',
  },
  {
    number: 7,
    name: 'Shi',
    chineseName: '师',
    subtitle: 'The Army - Disciplined Action',
    rating: 'Favorable',
    upperTrigram: 'Earth',
    lowerTrigram: 'Water',
    image:
      'A general receives imperial orders to march, riding a spirited horse with a hard-drawn bow. An arrow strikes a coin at a hundred paces — a burst of joy.',
    description:
      'Water below, Earth above. Water signifies danger; Earth signifies compliance. This hexagram speaks of soldiers hidden among farmers. War is perilous, but when the cause is just and conditions align, the campaign resolves conflict smoothly, turning danger into fortune.',
  },
  {
    number: 8,
    name: 'Bi',
    chineseName: '比',
    subtitle: 'Holding Together - Unity',
    rating: 'Highly Auspicious',
    upperTrigram: 'Water',
    lowerTrigram: 'Earth',
    image:
      'Sailing with a fair wind, the sails are set — then heaven sends another gust to fill them. Without effort you glide at leisure; traveling at will, all flows smoothly.',
    description:
      'Earth below, Water above. Water clings to the earth, and the earth embraces rivers and seas — mutually dependent and intimately connected. This hexagram teaches the way of closeness, generosity, sincerity, and unity.',
  },
  {
    number: 9,
    name: 'Xiao Chu',
    chineseName: '小畜',
    subtitle: 'Small Accumulation - Restrained Progress',
    rating: 'Challenging',
    upperTrigram: 'Wind',
    lowerTrigram: 'Heaven',
    image:
      'Seedlings wither in drought, scorched at their tips. Clouds gather thick but no rain falls. The farmer gazes skyward with a long sigh — do not set hopes too high just yet.',
    description:
      'Heaven below, Wind above — gentle wind beneath vast sky. The imagery suggests favorable weather nurturing growth, but limited power. One must wait until strength has developed sufficiently before attempting great things.',
  },
  {
    number: 10,
    name: 'Lu',
    chineseName: '履',
    subtitle: 'Treading - Careful Conduct',
    rating: 'Favorable',
    upperTrigram: 'Heaven',
    lowerTrigram: 'Lake',
    image:
      'A phoenix alights on Mount Qishan and cries out, heralding the arrival of a sage. Heaven sends King Wen to lay foundations — eight hundred years of glory and prosperity.',
    description:
      'Lake below, Heaven above. Walking on a tiger\'s tail, yet it does not bite — the outcome is auspicious. When ruler is above and people below, each in their proper place, and gentleness meets firmness, one treads on dangerous ground but proceeds safely. "Lu" means practice: stepping forward resolutely and practically.',
  },
  {
    number: 11,
    name: 'Tai',
    chineseName: '泰',
    subtitle: 'Peace - Harmony and Prosperity',
    rating: 'Moderate',
    upperTrigram: 'Earth',
    lowerTrigram: 'Heaven',
    image:
      'A scholar full of learning enters the examination hall, achieves top honors, and returns in triumph. From now on, worry and gloom dissolve — a thunderclap of joy upon level ground.',
    description:
      'Heaven below, Earth above. Yang descends and yin rises; yin and yang intermingle, and heaven and earth communicate. All things flourish. Yet extremes always reverse: great prosperity can yield to decline, and decline can blossom into prosperity. The one who adapts to the times finds peace.',
  },
  {
    number: 12,
    name: 'Pi',
    chineseName: '否',
    subtitle: 'Standstill - Stagnation',
    rating: 'Moderate',
    upperTrigram: 'Heaven',
    lowerTrigram: 'Earth',
    image:
      'A tiger fallen into a pit — words cannot describe the misery. Moving forward is easy, but retreating is hard. Plans go unfulfilled; illness and troubles are intertwined.',
    description:
      'Earth below, Heaven above — the reverse of Tai. Yang rises and yin sinks; heaven and earth do not communicate, and all things stagnate. Yet Tai and Pi are each other\'s cause: when stagnation reaches its extreme, peace returns.',
  },
  {
    number: 13,
    name: 'Tong Ren',
    chineseName: '同人',
    subtitle: 'Fellowship - Harmony with Others',
    rating: 'Favorable',
    upperTrigram: 'Heaven',
    lowerTrigram: 'Fire',
    image:
      'Doubts fill the heart and suspicions cloud every hope. Fortunately, a wise guide appears and points the way — all worries and sorrows dissolve on their own.',
    description:
      'Fire below, Heaven above. Heaven above and fire below — fire rises to meet heaven, a symbol of unity and shared purpose. Fellowship means working together, rowing in the same boat, and achieving harmony among people and in the world.',
  },
  {
    number: 14,
    name: 'Da You',
    chineseName: '大有',
    subtitle: 'Great Possession - Abundance',
    rating: 'Highly Auspicious',
    upperTrigram: 'Fire',
    lowerTrigram: 'Heaven',
    image:
      'Chopping a tree to catch a sparrow — a reliable strategy. Disputes and gossip vanish naturally. Marriage and partnerships come effortlessly; if you ask about a lost item, it has not escaped.',
    description:
      'Heaven below, Fire above. Fire in the sky illuminates all things; the multitudes are loyal. By following heaven\'s way and acting in accordance with the times, great abundance is achieved.',
  },
  {
    number: 15,
    name: 'Qian',
    chineseName: '谦',
    subtitle: 'Modesty - Humble Excellence',
    rating: 'Moderate',
    upperTrigram: 'Earth',
    lowerTrigram: 'Mountain',
    image:
      'Heaven grants the humble one a gift of gold. Without争 or争, both share it equally. Each receives gold in hand — all wishes and plans come to fruition.',
    description:
      'Mountain below, Earth above. A mountain beneath the earth — high within, low without. This symbolizes one whose merits are great yet who does not boast, whose name is esteemed yet who does not flaunt, whose position is lofty yet who remains humble. This is modesty.',
  },
  {
    number: 16,
    name: 'Yu',
    chineseName: '豫',
    subtitle: 'Enthusiasm - Joyful Movement',
    rating: 'Moderate',
    upperTrigram: 'Thunder',
    lowerTrigram: 'Earth',
    image:
      'Grand Duke Jiang plants the apricot-yellow banner and gathers followers to return west. The green dragon finds its rightful place — all plans bring a hundred blessings.',
    description:
      'Earth below, Thunder above. Thunder issues from the earth in due season, heralding spring\'s return. Moving in harmony with the natural order is the source of joy and delight. This hexagram and Modesty are complementary, each informing the other.',
  },
  {
    number: 17,
    name: 'Sui',
    chineseName: '随',
    subtitle: 'Following - Adaptive Movement',
    rating: 'Moderate',
    upperTrigram: 'Lake',
    lowerTrigram: 'Thunder',
    image:
      'For years one has slogged through mud, pushing a cart toward a cliff\'s edge. Now is the time to push harder — clamber up the cliff and find a source of wealth.',
    description:
      'Thunder below, Lake above — movement brings joy. "Following" means mutual responsiveness: you adapt to circumstances and they adapt to you. One must follow the flow of time and circumstance, guided by principle and integrity.',
  },
  {
    number: 18,
    name: 'Gu',
    chineseName: '蛊',
    subtitle: 'Decay - Renewal and Reform',
    rating: 'Moderate',
    upperTrigram: 'Mountain',
    lowerTrigram: 'Wind',
    image:
      'The hexagram\'s lines are like grinding a millstone — what should flow smoothly becomes disaster if reversed. Benefits lie in patience; rushing through every task invites mistakes.',
    description:
      'Wind below, Mountain above. "Gu" means corruption: a vessel long unused breeds decay. This symbolizes a world grown stale through inertia. Innovation, reform, and decisive action are needed to rescue the situation and rebuild.',
  },
  {
    number: 19,
    name: 'Lin',
    chineseName: '临',
    subtitle: 'Approach - Watchful Governance',
    rating: 'Favorable',
    upperTrigram: 'Earth',
    lowerTrigram: 'Lake',
    image:
      'A tyrannical ruler leaves the people suffering, yearning for clear skies beyond the clouds. Then a benevolent sovereign enacts wise governance — all dwell in peace and contentment once more.',
    description:
      'Lake below, Earth above. The earth rises above the lake; the lake rests within the earth. A ruler draws near to the people, governing with care — above and below in harmony.',
  },
  {
    number: 20,
    name: 'Guan',
    chineseName: '观',
    subtitle: 'Contemplation - Observation',
    rating: 'Favorable',
    upperTrigram: 'Wind',
    lowerTrigram: 'Earth',
    image:
      'A lotus flower blooms in a drought, then meets a river. Business and trade bring abundant profit. In marriage, help arrives on its own. When you venture out, no misfortune befalls you.',
    description:
      'Earth below, Wind above — wind sweeps across the land, spreading virtue everywhere. Those above observe the way of heaven and instruct the world; those below look up in reverence. Hearts willingly submit and follow.',
  },
  {
    number: 21,
    name: 'Shi He',
    chineseName: '噬嗑',
    subtitle: 'Biting Through - Decisive Justice',
    rating: 'Highly Auspicious',
    upperTrigram: 'Fire',
    lowerTrigram: 'Thunder',
    image:
      'When fortune is low, one suffers as though starving — then food is delivered unexpectedly. A satisfying meal fills the belly and brings joy; worry and sorrow gradually fade away.',
    description:
      'Thunder below, Fire above. Yin meets yang; jaws bite together and crunch through obstruction. This symbolizes the balanced application of kindness and severity, gentleness and firmness, mercy and justice.',
  },
  {
    number: 22,
    name: 'Bi',
    chineseName: '贲',
    subtitle: 'Grace - Elegant Adornment',
    rating: 'Favorable',
    upperTrigram: 'Mountain',
    lowerTrigram: 'Fire',
    image:
      'Good fortune has lately turned; auspicious energy surrounds you. A refined lady is sought by a noble gentleman — drums and bells play in celebration. This hexagram foretells joy.',
    description:
      'Fire below, Mountain above — brightness tempered by restraint. "Bi" means adornment. This hexagram explores the relationship between substance and style: substance is the foundation, and refinement gives it expression. Elegance should enhance, not obscure.',
  },
  {
    number: 23,
    name: 'Bo',
    chineseName: '剥',
    subtitle: 'Splitting Apart - Decline',
    rating: 'Moderate Challenge',
    upperTrigram: 'Mountain',
    lowerTrigram: 'Earth',
    image:
      'A magpie roosting at dusk finds a hawk already hidden in the trees. Though they share the same perch, the hawk harbors ill intent — yet this hexagram brings only minor conflict.',
    description:
      'Earth below, Mountain above. Five yin lines overpower a single yang — yin prevails and yang is isolated. The mountain crumbles upon the earth: an image of stripping away. Small people gain influence while the noble person faces adversity.',
  },
  {
    number: 24,
    name: 'Fu',
    chineseName: '复',
    subtitle: 'Return - Renewal',
    rating: 'Moderate',
    upperTrigram: 'Earth',
    lowerTrigram: 'Thunder',
    image:
      'Ma and the Grand Duke cannot agree; those who draw this hexagram face doubt and worry. A benefactor turns hostile; disputes and conflict arise on level ground.',
    description:
      'Thunder below, Earth above. Thunder stirs, earth yields — movement within stillness. Yang energy returns from below, cycling naturally. Progress is orderly; advance and retreat flow freely. Conditions favor forward movement.',
  },
  {
    number: 25,
    name: 'Wu Wang',
    chineseName: '无妄',
    subtitle: 'Innocence - Acting Without Guile',
    rating: 'Challenging',
    upperTrigram: 'Heaven',
    lowerTrigram: 'Thunder',
    image:
      'A bird in flight loses its way and falls into a cage. Though it beats its wings frantically, it cannot take off. For now, simply guard your place — grand ambitions are quite impossible.',
    description:
      'Thunder below, Heaven above. Strength and dynamism unite; the spirit is uplifted and gain is assured — yet only through honest, straightforward action. Innocence brings reward and blessing.',
  },
  {
    number: 26,
    name: 'Da Chu',
    chineseName: '大畜',
    subtitle: 'Great Accumulation - Building Reserves',
    rating: 'Favorable',
    upperTrigram: 'Mountain',
    lowerTrigram: 'Heaven',
    image:
      'Worry has long furrowed both brows. A thousand tangled threads weigh on the heart. But from today, set your defenses and then move freely — nothing can stand in your way.',
    description:
      'Heaven below, Mountain above. Heaven is strong; the mountain is steadfast. Great accumulation means building vast reserves. Do not shrink from severe hardship; cultivate your character and enrich your virtue.',
  },
  {
    number: 27,
    name: 'Yi',
    chineseName: '颐',
    subtitle: 'Nourishment - Proper Sustenance',
    rating: 'Highly Auspicious',
    upperTrigram: 'Mountain',
    lowerTrigram: 'Thunder',
    image:
      'Grand Duke Jiang fishes alone at the Wei River, line in hand, weighed down by care — until King Wen pays him a visit, and from then on he is free from torment forever.',
    description:
      'Thunder below, Mountain above. Solid without, hollow within. Spring warmth nurtures all living things; in due time, worthy people are cultivated and the people are cared for. Those with substance nourish others; those without are nourished in return. Self-reliance is the ideal.',
  },
  {
    number: 28,
    name: 'Da Guo',
    chineseName: '大过',
    subtitle: 'Great Excess - Extraordinary Times',
    rating: 'Moderate Challenge',
    upperTrigram: 'Lake',
    lowerTrigram: 'Wind',
    image:
      'You dream of gold and silver at night, but wake to find not a single coin. For now, just tend to your own business — grand schemes are nothing but wasted thought.',
    description:
      'Wind below, Lake above. The lake overflows and swamps the boat — a grave mistake. Yin and yang are reversed; action is extraordinary and excessive. One must be firm inside yet flexible outside.',
  },
  {
    number: 29,
    name: 'Kan',
    chineseName: '坎',
    subtitle: 'The Abysmal - Repeated Danger',
    rating: 'Challenging',
    upperTrigram: 'Water',
    lowerTrigram: 'Water',
    image:
      'A bright moon reflected in water — one sees only the image, never the substance. A fool reaches down to grab the treasure, groping and grasping, yet comes away empty-handed.',
    description:
      'Water doubled: danger upon danger, peril upon peril. A single yang trapped between two yin lines. Yet where yin is hollow and yang is real, sincerity can break through. Though dangers multiply, they reveal the brilliance of the human spirit.',
  },
  {
    number: 30,
    name: 'Li',
    chineseName: '离',
    subtitle: 'The Clinging - Radiance',
    rating: 'Favorable',
    upperTrigram: 'Fire',
    lowerTrigram: 'Fire',
    image:
      'An official draws this hexagram and gains a promotion. A farmer\'s estate and harvest grow. Business and trade yield handsome returns. Any craft or endeavor prospers greatly.',
    description:
      'Fire doubled. Li means to cling, to attach: a single yin line adheres between two yang lines. Fire illuminates from within and blazes outward. Like the sun rising and setting without cease, it symbolizes continuous motion and gentle receptivity at heart.',
  },
  {
    number: 31,
    name: 'Xian',
    chineseName: '咸',
    subtitle: 'Influence - Mutual Attraction',
    rating: 'Favorable',
    upperTrigram: 'Lake',
    lowerTrigram: 'Mountain',
    image:
      'When fortune wanes, even gold loses its sheen. When fortune returns, a dead stick sprouts buds. The season is right — rejoice with an open heart and generous spirit.',
    description:
      'Mountain below, Lake above. Gentle water above, firm mountain below — they attract and respond to each other. Influence leads to completion. Feeling and mutual resonance bring all things together.',
  },
  {
    number: 32,
    name: 'Heng',
    chineseName: '恒',
    subtitle: 'Duration - Perseverance',
    rating: 'Favorable',
    upperTrigram: 'Thunder',
    lowerTrigram: 'Wind',
    image:
      'A fisherman out seeking fish finds his luck is good — the fish swim right into his net. Others spend money and catch nothing, yet this one succeeds on the very first try.',
    description:
      'Wind below, Thunder above. Thunder is strong and wind is gentle: the firm above supports the yielding below. Together they sustain each other and grow. Yin and yang correspond in a pattern of constancy — hence "Duration."',
  },
  {
    number: 33,
    name: 'Dun',
    chineseName: '遁',
    subtitle: 'Retreat - Strategic Withdrawal',
    rating: 'Challenging',
    upperTrigram: 'Heaven',
    lowerTrigram: 'Mountain',
    image:
      'Heavy clouds obscure the sun — no clarity in sight. Do not venture far from home. Marriage and financial plans all look unfavorable. Guard against gossip arriving at your door.',
    description:
      'Mountain below, Heaven above. The sky retreats as the mountain stands tall. Yin advances and yang recedes; lesser forces gain power. The wise person withdraws to preserve themselves, awaiting the right moment to help the world.',
  },
  {
    number: 34,
    name: 'Da Zhuang',
    chineseName: '大壮',
    subtitle: 'Great Power - Strength in Action',
    rating: 'Favorable',
    upperTrigram: 'Thunder',
    lowerTrigram: 'Heaven',
    image:
      'A master builder finds fine timber — now the road ahead is clear. Fortune turns and all goes smoothly; set your worries aside and be at ease.',
    description:
      'Heaven below, Thunder above. Thunder roars across the sky; clouds roll and rumble, magnificent in power. Yang energy is robust and all things grow. Great strength calls for great responsibility — act correctly, remain upright, and your influence will be true.',
  },
  {
    number: 35,
    name: 'Jin',
    chineseName: '晋',
    subtitle: 'Progress - Advancing Forward',
    rating: 'Favorable',
    upperTrigram: 'Fire',
    lowerTrigram: 'Earth',
    image:
      'Hoeing the field, one clears weeds from among the seedlings — who would have thought that wealth would come seeking? One stroke of the hoe turns up silver — what good fortune!',
    description:
      'Earth below, Fire above. The sun rises high over the land, illuminating all. The earth is receptive and things grow. Bright and transparent, progressing gently upward — one\'s endeavors flourish and advance.',
  },
  {
    number: 36,
    name: 'Ming Yi',
    chineseName: '明夷',
    subtitle: 'Darkening of the Light - Hidden Brilliance',
    rating: 'Moderate Challenge',
    upperTrigram: 'Earth',
    lowerTrigram: 'Fire',
    image:
      'Luck and timing have gone awry — you rush to cross a river only to find the bridge demolished. A benefactor proves faithless and turns resentful. Every effort yields nothing, and labor goes to waste.',
    description:
      'Fire below, Earth above. The sun sinks beneath the earth; light is wounded and the path ahead is dark. In difficult times, one should conceal one\'s brilliance, follow the correct path, appear unassuming outwardly while remaining wise within — biding time and waiting for dawn.',
  },
  {
    number: 37,
    name: 'Jia Ren',
    chineseName: '家人',
    subtitle: 'The Family - Domestic Harmony',
    rating: 'Challenging',
    upperTrigram: 'Wind',
    lowerTrigram: 'Fire',
    image:
      'A fresh flower blooms inside a mirror — visible but impossible to pluck. Do not pine for reflections of flowers. If this hexagram appears, expect the unexpected.',
    description:
      'Fire below, Wind above. Fire heats the air and creates wind. Everything begins within and radiates outward. First set your own house in order, then extend that order to the world. When the family is right, all under heaven can be at peace.',
  },
  {
    number: 38,
    name: 'Kui',
    chineseName: '睽',
    subtitle: 'Opposition - Finding Unity in Difference',
    rating: 'Challenging',
    upperTrigram: 'Fire',
    lowerTrigram: 'Lake',
    image:
      'This hexagram foretells poor fortune — like the Grand Duke who herded pigs, cattle, and sheep. Selling pigs was quick, selling sheep was slow, and selling both at once ended in disaster.',
    description:
      'Lake below, Fire above. Fire rises while water sinks — opposing forces that do not assist each other. Yet clash also generates creative energy. All things differ; within contradiction lies potential. "Kui" means divergence, yet through it, common ground may be found.',
  },
  {
    number: 39,
    name: 'Jian',
    chineseName: '蹇',
    subtitle: 'Obstruction - Difficulty Ahead',
    rating: 'Challenging',
    upperTrigram: 'Water',
    lowerTrigram: 'Mountain',
    image:
      'Heavy rain pours down and snow fills the sky. Travelers on the road suffer in cold and hardship, dragging through mud with all their strength. Nothing goes as hoped — simply endure with patience.',
    description:
      'Mountain below, Water above. The mountain is high and the water deep; obstacles loom on every side. Life is full of hardship; recognizing danger and stopping in time is wisdom. "Jian" means to limp along a hard road.',
  },
  {
    number: 40,
    name: 'Xie',
    chineseName: '解',
    subtitle: 'Deliverance - Liberation',
    rating: 'Favorable',
    upperTrigram: 'Thunder',
    lowerTrigram: 'Water',
    image:
      'The current season is like passing through a checkpoint — enduring great hardship and suffering. But at the right moment, a rescuer appears. From then on, act as you wish without concern.',
    description:
      'Water below, Thunder above. Danger within, movement without. The long winter of obstruction breaks open; spring returns and all is renewed. Everything clears; obstacles dissolve. This is deliverance.',
  },
  {
    number: 41,
    name: 'Sun',
    chineseName: '损',
    subtitle: 'Decrease - Sacrifice for Balance',
    rating: 'Challenging',
    upperTrigram: 'Mountain',
    lowerTrigram: 'Lake',
    image:
      'Fortune has not arrived and the heart labors greatly — like pushing a cart and enduring hardship. The mountain road is steep and one struggles at every turn; pushing left and right but finding no grip.',
    description:
      'Lake below, Mountain above. The lake erodes the mountain\'s base. Decrease and increase alternate; within loss there is gain, and within gain, loss. One must weigh matters carefully. Reduce excess below to benefit those above — but only within measure.',
  },
  {
    number: 42,
    name: 'Yi',
    chineseName: '益',
    subtitle: 'Increase - Abundant Growth',
    rating: 'Highly Auspicious',
    upperTrigram: 'Wind',
    lowerTrigram: 'Thunder',
    image:
      'Fortune has turned and auspicious energy surges. A tree long dead now blooms again; branches and leaves grow thick and lush. All who see it marvel and praise.',
    description:
      'Thunder below, Wind above. Wind and thunder reinforce each other: the louder the thunder, the stronger the wind. They assist and amplify one another. This hexagram is the counterpart of Decrease: it decreases the top to increase the bottom.',
  },
  {
    number: 43,
    name: 'Guai',
    chineseName: '夬',
    subtitle: 'Breakthrough - Resolute Action',
    rating: 'Highly Auspicious',
    upperTrigram: 'Lake',
    lowerTrigram: 'Heaven',
    image:
      'A spider spins its web like a heavenly army. A buzzing bee gets caught, wings and all. Luckily, a great wind tears the web apart — free once more from disaster, soaring at ease.',
    description:
      'Heaven below, Lake above. Lake vapor rises, condenses, and falls as rain upon the earth, nourishing all. Five yang lines eliminate one yin — the task is not difficult. "Guai" means to decide, to break through.',
  },
  {
    number: 44,
    name: 'Gou',
    chineseName: '姤',
    subtitle: 'Coming to Meet - Unexpected Encounter',
    rating: 'Auspicious',
    upperTrigram: 'Heaven',
    lowerTrigram: 'Wind',
    image:
      'Meeting an old friend far from home brings a rush of joy. Fortune and blessings are redoubled. From now on, smooth sailing lies ahead — nothing more to worry about.',
    description:
      'Wind below, Heaven above. Wind blows beneath the sky, reaching everywhere; yin and yang meet and all things thrive. "Gou" means encounter — a sudden, significant meeting. Yet five yang against one yin warns that such encounters may not last.',
  },
  {
    number: 45,
    name: 'Cui',
    chineseName: '萃',
    subtitle: 'Gathering Together - Assembly',
    rating: 'Favorable',
    upperTrigram: 'Lake',
    lowerTrigram: 'Earth',
    image:
      'A fish at play is startled by a net, but leaps over the dragon gate and transforms into a dragon. A three-foot willow trails threads of gold; ten thousand peach blossoms show their splendor.',
    description:
      'Earth below, Lake above. The lake spills over the land; many people gather and rivalries emerge. One must plan ahead, follow heaven\'s will, and employ the worthy — remain gentle and harmonious, and all will benefit together. "Cui" means assembly, gathering, and unity.',
  },
  {
    number: 46,
    name: 'Sheng',
    chineseName: '升',
    subtitle: 'Pushing Upward - Steady Ascent',
    rating: 'Highly Auspicious',
    upperTrigram: 'Earth',
    lowerTrigram: 'Wind',
    image:
      'A scholar who draws this hexagram will surely earn renown. Business and trade flourish. Craftsmen find excellent deals. Farmers reap a bountiful harvest.',
    description:
      'Wind below, Earth above. Trees grow from the earth, rising gradually to great heights. This symbolizes a career steadily ascending, with broad horizons ahead. Rise humbly and with deference — hence the name "Pushing Upward."',
  },
  {
    number: 47,
    name: 'Kun',
    chineseName: '困',
    subtitle: 'Oppression - Persevering Through Hardship',
    rating: 'Favorable',
    upperTrigram: 'Lake',
    lowerTrigram: 'Water',
    image:
      'Fortunes haven\'t come and the heart aches — reaching up to grab only to find the ladder pulled away. Empty-handed and trapped, you go up but cannot come back down.',
    description:
      'Water below, Lake above. Joy above danger. Lake water drains and the situation is dire; talent cannot be displayed. Yet by holding firm to the right path and finding contentment within, one can prevail, escape confinement, and succeed.',
  },
  {
    number: 48,
    name: 'Jing',
    chineseName: '井',
    subtitle: 'The Well - Inexhaustible Source',
    rating: 'Highly Auspicious',
    upperTrigram: 'Water',
    lowerTrigram: 'Wind',
    image:
      'An old well neglected for years, money spent on repairs — until one day fresh water flows. People come from far and wide, marveling and grateful. Fortune turns and joy arises naturally.',
    description:
      'Wind below, Water above. Trees draw water upward and flourish. People depend on wells to live; wells are dug by human hands. Each sustains the other. The well nourishes inexhaustibly — take this virtue to heart and labor diligently.',
  },
  {
    number: 49,
    name: 'Ge',
    chineseName: '革',
    subtitle: 'Revolution - Transformation',
    rating: 'Highly Auspicious',
    upperTrigram: 'Lake',
    lowerTrigram: 'Fire',
    image:
      'Crops wither in drought and begin to die, then heaven\'s grace sends rain. Worry gives way to joy as change arrives — every plan and endeavor is fulfilled.',
    description:
      'Fire below, Lake above. Fire heats and water evaporates; water can also drown fire. They create and destroy each other — transformation is inevitable. Revolution is the fundamental law of the universe.',
  },
  {
    number: 50,
    name: 'Ding',
    chineseName: '鼎',
    subtitle: 'The Cauldron - Stable Innovation',
    rating: 'Moderate Challenge',
    upperTrigram: 'Fire',
    lowerTrigram: 'Wind',
    image:
      'A sandpiper and a clam wrestle on the beach — the clam clamps the piper, the piper clamps the clam. A fisherman walks up and wins both prizes. The traveler who wanders by does just fine.',
    description:
      'Wind below, Fire above. Wood feeds fire to cook food — transforming the raw into the cooked, the old into the new. The cauldron is a great treasure, stable on three legs. With nourishment secured, it is time to innovate and advance one\'s work.',
  },
  {
    number: 51,
    name: 'Zhen',
    chineseName: '震',
    subtitle: 'The Arousing - Thunder and Awakening',
    rating: 'Favorable',
    upperTrigram: 'Thunder',
    lowerTrigram: 'Thunder',
    image:
      'A golden bell buried in mud — everyone treats it as a common stone. Then one day the bell is hung up high and rings clearly — its sound reverberates across the land.',
    description:
      'Thunder doubled: a tremendous roar that clears stagnation and opens the way. In daily life, one should remain vigilant even in safety, holding a healthy sense of awe. When sudden upheaval strikes, a composed person laughs and carries on.',
  },
  {
    number: 52,
    name: 'Gen',
    chineseName: '艮',
    subtitle: 'Keeping Still - Meditation',
    rating: 'Moderate Challenge',
    upperTrigram: 'Mountain',
    lowerTrigram: 'Mountain',
    image:
      'Money is always on your mind, yet it never reaches your hands. In unfavorable times, be patient and endure. When idle matters arise, hold your tongue.',
    description:
      'Mountain doubled: perfect stillness. The opposite of Thunder — after the peak comes the trough, and things enter a period of rest. Stillness like a mountain: stop when it is time to stop, move when it is time to move. Both action and stillness must be timely and fitting.',
  },
  {
    number: 53,
    name: 'Jian',
    chineseName: '渐',
    subtitle: 'Gradual Progress - Step by Step',
    rating: 'Highly Auspicious',
    upperTrigram: 'Wind',
    lowerTrigram: 'Mountain',
    image:
      'A fine bird freed from its cage escapes disaster and shows its glory. Good fortune and blessings arrive at once. North, south, east, or west — go wherever you please.',
    description:
      'Mountain below, Wind above. Trees on a mountain grow taller over time; the mountain itself seems to rise. This is gradual, steady progress — moving forward without rushing, accumulating virtue along the way.',
  },
  {
    number: 54,
    name: 'Gui Mei',
    chineseName: '归妹',
    subtitle: 'The Marrying Maiden - New Beginnings',
    rating: 'Challenging',
    upperTrigram: 'Thunder',
    lowerTrigram: 'Lake',
    image:
      'Seeking fish, you must look in the water — searching in a treetop goes against reason. Climbing and scrambling fruitlessly, labor yields nothing, and fortune stays flat.',
    description:
      'Lake below, Thunder above. Movement and joy combine — the younger woman follows the elder man. Affection stirs and marriage is symbolized. This hexagram speaks of new unions, beginnings, and the great cycle of human life.',
  },
  {
    number: 55,
    name: 'Feng',
    chineseName: '丰',
    subtitle: 'Abundance - Peak Prosperity',
    rating: 'Highly Auspicious',
    upperTrigram: 'Thunder',
    lowerTrigram: 'Fire',
    image:
      'An ancient mirror, tarnished for years, is suddenly polished bright as the full moon. A noble person who encounters this hexagram finds fortune turning naturally in their favor.',
    description:
      'Fire below, Thunder above. Lightning flashes and thunder roars — a magnificent culmination, like the sun at its zenith. But beware: what reaches the top must begin to fall. Prosperity and chaos are intertwined, and one must remain vigilant.',
  },
  {
    number: 56,
    name: 'Lu',
    chineseName: '旅',
    subtitle: 'The Wanderer - Journey',
    rating: 'Challenging',
    upperTrigram: 'Fire',
    lowerTrigram: 'Mountain',
    image:
      'A bird builds its nest high in a tree, but a mischief-maker sets it ablaze. This hexagram is unfavorable for the questioner — all plans and hopes end in vain effort.',
    description:
      'Mountain below, Fire above. Fire burns across the mountain and does not stop, spreading ever onward like a traveler hurrying along the road. Hence "The Wanderer." One must act with righteousness and adapt to circumstances while traveling through life.',
  },
  {
    number: 57,
    name: 'Xun',
    chineseName: '巽',
    subtitle: 'The Gentle - Penetrating Influence',
    rating: 'Favorable',
    upperTrigram: 'Wind',
    lowerTrigram: 'Wind',
    image:
      'A lone boat stranded on a sandbar — with an oar but no water, advance and retreat are both impossible. Then heavy rains swell the rivers and lakes, and one sails freely without effort.',
    description:
      'Wind doubled: a long, continuous breeze that penetrates everywhere without obstruction. Gentleness and humility are the way of Xun. A modest, yielding attitude opens every door.',
  },
  {
    number: 58,
    name: 'Dui',
    chineseName: '兑',
    subtitle: 'The Joyous - Shared Delight',
    rating: 'Highly Auspicious',
    upperTrigram: 'Lake',
    lowerTrigram: 'Lake',
    image:
      'This hexagram is truly worth drawing — everything seems effortless. Do not miss this opportunity; all affairs proceed exactly as your heart desires.',
    description:
      'Lake doubled: two lakes connected, waters flowing together — a symbol of harmony, unity, and mutual aid. Joy and delight abound. Firm strength within, gentle appearance without: uphold the right path and lead others upward.',
  },
  {
    number: 59,
    name: 'Huan',
    chineseName: '涣',
    subtitle: 'Dispersion - Overcoming Disunity',
    rating: 'Challenging',
    upperTrigram: 'Wind',
    lowerTrigram: 'Water',
    image:
      'Across the river you spot a gold ingot, but the bank is wide and the water deep. Wealth that seems so near is impossibly out of reach — daydreaming about it is a waste of energy.',
    description:
      'Water below, Wind above. Wind drives waves that scatter in all directions. This hexagram symbolizes disorder and fragmentation in organizations and hearts alike. Positive, active measures are needed to overcome the scattering and turn danger into safety.',
  },
  {
    number: 60,
    name: 'Jie',
    chineseName: '节',
    subtitle: 'Limitation - Balanced Restraint',
    rating: 'Highly Auspicious',
    upperTrigram: 'Water',
    lowerTrigram: 'Lake',
    image:
      'Fortune arrives in a surge of joy — Jiang Taigong is enthroned as a god. All other spirits step aside before him; even disaster cannot become calamity.',
    description:
      'Lake below, Water above. The lake holds water, but only so much before it overflows. Therefore, there must be moderation. Heaven and earth have limits that keep them new; a nation with limits remains stable; a person with limits achieves wholeness.',
  },
  {
    number: 61,
    name: 'Zhong Fu',
    chineseName: '中孚',
    subtitle: 'Inner Truth - Sincerity',
    rating: 'Challenging',
    upperTrigram: 'Wind',
    lowerTrigram: 'Lake',
    image:
      'A traveler hurries along, anxious and rushed, stepping onto thin ice to cross. Careful and cautious, one may get across — but one wrong step plunges you into the water.',
    description:
      'Lake below, Wind above. The shape is solid outside, hollow within — symbolizing sincerity at heart. "Zhong Fu" means inner truth. Just as an egg hatches on a precisely reliable schedule, so does inner sincerity lead to trustworthy outcomes. This is the foundation of living and dealing with the world.',
  },
  {
    number: 62,
    name: 'Xiao Guo',
    chineseName: '小过',
    subtitle: 'Small Exceeding - Measured Steps',
    rating: 'Favorable',
    upperTrigram: 'Thunder',
    lowerTrigram: 'Mountain',
    image:
      'A traveler crosses a narrow wooden bridge, heart pounding, eyes wide. Step quickly and you can make it safely — dawdle and you will surely slip.',
    description:
      'Mountain below, Thunder above. Thunder rumbles over the mountain — one cannot help but feel awe. Yin lines outnumber yang: the small exceeds the great. Minor overstepping may occur, but with measured, careful action, one stays on course.',
  },
  {
    number: 63,
    name: 'Ji Ji',
    chineseName: '既济',
    subtitle: 'After Completion - Success Achieved',
    rating: 'Favorable',
    upperTrigram: 'Water',
    lowerTrigram: 'Fire',
    image:
      'Your name is written on the golden roll of honor — years of hard study have not been in vain. All who encounter this hexagram celebrate; every plan and wish flows to great success.',
    description:
      'Fire below, Water above. Water quenches fire: the great task is accomplished. "Ji Ji" means already completed. Success has been achieved, but change is inevitable. At the pinnacle, one must remain alert, for what is finished will eventually shift again.',
  },
  {
    number: 64,
    name: 'Wei Ji',
    chineseName: '未济',
    subtitle: 'Before Completion - Unfinished Business',
    rating: 'Moderate Challenge',
    upperTrigram: 'Fire',
    lowerTrigram: 'Water',
    image:
      'Fallen deep into a pit, one must guard against intruders and thieves. Later honored as the Grand Duke of malevolent stars — add caution at every turn and disaster will not touch you.',
    description:
      'Water below, Fire above. Fire presses down on water, but the rescue is not yet complete — hence "Before Completion." The I Ching begins with Qian and Kun and ends with Ji Ji and Wei Ji, perfectly reflecting the philosophy of continuous change and development. Nothing ever truly ends; every ending is a new beginning.',
  },
]

/**
 * Determine the hexagram number from 6 lines (bottom to top).
 * Each line value: 6 = old yin, 7 = young yang, 8 = young yin, 9 = old yang
 * For the primary hexagram, 6 and 8 are yin (0), 7 and 9 are yang (1).
 */
export function getHexagramFromLines(lines: number[]): Hexagram {
  // Lines are ordered bottom (index 0) to top (index 5)
  // Lower trigram = lines 0,1,2; Upper trigram = lines 3,4,5
  const toBinary = (val: number) => (val === 7 || val === 9 ? '1' : '0')

  const lowerKey = lines
    .slice(0, 3)
    .map(toBinary)
    .join('')
  const upperKey = lines
    .slice(3, 6)
    .map(toBinary)
    .join('')

  const lowerTrigram = TRIGRAM_MAP[lowerKey]
  const upperTrigram = TRIGRAM_MAP[upperKey]

  const hexNumber = HEXAGRAM_LOOKUP[lowerTrigram][upperTrigram]
  return HEXAGRAMS[hexNumber - 1]
}

/**
 * Simulate tossing three coins.
 * Heads = 3, Tails = 2
 * Returns the sum: 6 (old yin), 7 (young yang), 8 (young yin), 9 (old yang)
 */
export function tossCoinLine(): { coins: number[]; value: number } {
  const coins = [
    Math.random() < 0.5 ? 3 : 2,
    Math.random() < 0.5 ? 3 : 2,
    Math.random() < 0.5 ? 3 : 2,
  ]
  return { coins, value: coins[0] + coins[1] + coins[2] }
}

export function getLineType(value: number): {
  type: 'yang' | 'yin'
  changing: boolean
  label: string
} {
  switch (value) {
    case 6:
      return { type: 'yin', changing: true, label: 'Old Yin (Changing)' }
    case 7:
      return { type: 'yang', changing: false, label: 'Young Yang' }
    case 8:
      return { type: 'yin', changing: false, label: 'Young Yin' }
    case 9:
      return { type: 'yang', changing: true, label: 'Old Yang (Changing)' }
    default:
      return { type: 'yin', changing: false, label: 'Unknown' }
  }
}
