import { documentToReactComponents } from '@contentful/rich-text-react-renderer'
import { BLOCKS } from '@contentful/rich-text-types'

const RichText = ({ content, textStyle }) => {
  const options = {
    renderNode: {
      // eslint-disable-next-line react/display-name
      [BLOCKS.PARAGRAPH]: (node, children) => <p className={textStyle}>{children}</p>
    },
    renderText: (text) =>
      text.split('\n').flatMap((text, i) => [i > 0 && <br key={`br-${i}`} />, text])
  }

  return content && <div>{documentToReactComponents(content, options)}</div>
}

export default RichText
