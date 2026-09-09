export interface SearchDismissalLifecycle {
  readonly isSearchOpen: () => boolean
  readonly observeChanges: (callback: () => void) => () => void
  readonly defer: (callback: () => void) => void
  readonly restoreFocus: () => void
}

export function watchForSearchDismissal(
  lifecycle: SearchDismissalLifecycle,
): () => void {
  let active = true
  let searchWasOpen = false
  let stopRequestedBeforeObservation = false
  let stopObserving = () => {
    stopRequestedBeforeObservation = true
  }

  const stop = (): void => {
    if (!active) return
    active = false
    stopObserving()
  }

  const checkSearchState = (): void => {
    if (!active) return
    if (lifecycle.isSearchOpen()) {
      searchWasOpen = true
      return
    }
    if (!searchWasOpen) return

    stop()
    lifecycle.defer(lifecycle.restoreFocus)
  }

  const registeredStop = lifecycle.observeChanges(checkSearchState)
  stopObserving = registeredStop
  if (stopRequestedBeforeObservation) registeredStop()
  checkSearchState()

  return stop
}
