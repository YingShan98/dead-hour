import type { GameState, JournalEntry } from './types'

function getDayNumber(hoursFromStart: number): number {
  if (hoursFromStart <= 0) return 1
  return Math.floor(hoursFromStart / 24) + 1
}

export function generateJournalEntry(state: GameState): JournalEntry {
  const day = getDayNumber(state.gameTime.hoursFromStart)
  const { infection, will, morale } = state.stats

  const lines: string[] = []

  if (infection >= 7) {
    lines.push(
      '我不确定我还能写多久。手指变得很奇怪，不是普通意义上的奇怪。但我还是想写下去——因为如果之后有人找到这本，他们应该知道发生了什么。',
    )
  } else if (infection >= 5) {
    lines.push(
      '右手中指的感觉越来越难以忽视了。我把它写下来，因为如果我不写，我会告诉自己没什么大不了的。写下来就很难这样告诉自己了。',
    )
  } else if (infection >= 3) {
    lines.push(
      '手指没有好转。不是更糟，但也没有好转。我查了两次，没有找到任何能解释这个颜色的词。姑且记录在这里。',
    )
  } else {
    lines.push(
      '写下这些不是因为我有答案，而是因为有人应该记录正在发生的事情。我不确定会有多少人活着读到这本，但这不是写它的理由。',
    )
  }

  if (state.flags.noticed_patrol_pattern) {
    lines.push('楼下有移动规律。我记录了下来。这是可以利用的信息，如果之后有那个机会的话。')
  }

  if (state.flags.pei_status_trapped_outside) {
    lines.push(
      '裴嘉应还在外面。这是一个我暂时无法解决的问题。我把它写在「需要解决」那一栏，然后合上本子。',
    )
  }

  if (state.flags.neighbor_zombie) {
    lines.push('老陈那边已经不对了。我没有过去看。有些事情写下来比说出来更容易。')
  }

  if (will >= 7) {
    lines.push('「不确定」那栏最长。但至少知道自己在不确定什么——这比什么都不清楚要好得多。')
  } else if (morale <= 4) {
    lines.push('写不下去了。今天先到这里。')
  } else {
    lines.push(
      '三栏：确定的，不确定的，需要搞清楚的。「不确定」那栏最长。但这比一团模糊的害怕好处理。',
    )
  }

  return {
    day,
    text: { zh: lines.join('\n\n') },
  }
}
