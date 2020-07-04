# == Schema Information
#
# Table name: blocks
#
#  id              :uuid             not null, primary key
#  child_block_ids :uuid             default([]), not null, is an Array
#  paragraph       :jsonb            not null
#  tags            :string           default([]), not null, is an Array
#  title           :string
#  created_at      :datetime         not null
#  updated_at      :datetime         not null
#  parent_id       :uuid
#  root_note_id    :uuid
#
# Indexes
#
#  index_blocks_on_child_block_ids  (child_block_ids) USING gin
#  index_blocks_on_parent_id        (parent_id)
#  index_blocks_on_root_note_id     (root_note_id)
#  index_blocks_on_tags             (tags) USING gin
#  index_blocks_on_title            (title) UNIQUE
#
# Foreign Keys
#
#  fk_rails_...  (parent_id => blocks.id)
#  fk_rails_...  (root_note_id => blocks.id)
#
# TODO
# methods could be improved

class BlockSerializer
  def initialize block
    @block = block
  end

  def as_note_doc
    title_node = if @block.title
      {
        type: 'h1',
        content: [
          {
            type: 'text',
            text: @block.title
          }
        ]
      }
    else
      {
        type: 'h1',
        content: []
      }
    end

    content = [title_node]

    if !@block.child_blocks.empty?
      content << {
        type: 'bullet_list',
        content: @block.child_blocks.map{ |block|
          as_list_item_node block
        }
      }
    end

    doc = {
      type: 'doc',
      content: content
    }

    doc
  end

  private

  # node as in fragment for editor, without the `doc` wrapper, like
  # {type: paragraph, content: [{type: text, content: 'foo'}]}
  # 
  def as_list_item_node block
    content = [block.paragraph]

    if !block.child_blocks.empty?
      content << {
        type: 'bullet_list',
        content: block.child_blocks.map{ |child_block|
          as_list_item_node child_block
        }
      }
    end

    doc = {
      type: 'list_item',
      content: content
    }

    doc
  end

end