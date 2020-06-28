import { Controller } from 'stimulus'
import { nodeSchema } from './note/editor/schemas'
import Editor from './note/editor'
import Note from '../models/note'

export default class NoteController extends Controller {
  static targets = ['loader', 'titleMerger']

  // https://github.com/stimulusjs/stimulus/search?q=targets+typescript&type=Issues
  loaderTarget: HTMLElement
  titleMergerTarget: HTMLElement

  private note: Note
  private editor: Editor

  private updatingTitle: boolean = false
  private updatingBlocks: boolean = false

  connect() {
    console.log('stimulus: note connected on:')
    console.log(this.element)

    this.note = new Note(
      this.data.get('id'),
      () => this.handleTitleUpdatedOk(),
      (conflictedTitle) => this.handleTitleUpdatedConflict(conflictedTitle),
      () => this.handleBlocksUpdated(),
    )

    this.initEditor()

    this.refreshLoader()
  }

  private initEditor() {
    this.editor = new Editor(
      this,
      nodeSchema,
      this.element,
      JSON.parse(this.data.get('content')),
      JSON.parse(this.data.get('availableTags')),
    )
    this.editor.focusAtEnd()
  }

  public updateTitle(title: string) {
    this.setUpdatingTitle(true)
    this.note.updateTitleLater(title)
  }

  private handleTitleUpdatedOk() {
    this.setUpdatingTitle(false)
  }

  private handleTitleUpdatedConflict(conflictedTitle: string) {
    this.setUpdatingTitle(false)
    this.refreshTitleMerger(conflictedTitle)
  }

  public updateBlocks(blocks: JSON[]) {
    this.setUpdatingBlocks(true)
    this.note.updateBlocksLater(blocks)
  }

  private handleBlocksUpdated() {
    this.setUpdatingBlocks(false)
  }

  private setUpdatingTitle(value: boolean) {
    this.updatingTitle = value
    this.refreshLoader()
  }

  private setUpdatingBlocks(value: boolean) {
    this.updatingBlocks = value
    this.refreshLoader()
  }

  private refreshLoader() {
    let loading = this.updatingTitle || this.updatingBlocks
    let visibility = loading ? 'visible' : 'hidden'
    this.loaderTarget.style.visibility = visibility
  }

  private refreshTitleMerger(duplicatedTitle: string) {
    this.titleMergerTarget.innerHTML = duplicatedTitle ?
      `title conflict with: ${duplicatedTitle}` :
      ''
  }
}
