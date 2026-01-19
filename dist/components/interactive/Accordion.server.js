import { jsx as _jsx } from "react/jsx-runtime";
import { AccordionClient } from '../AccordionClient';
const defaultProps = {
    items: [
        {
            title: 'What is this?',
            content: 'This is an accordion component that can expand and collapse.',
            defaultOpen: false,
        },
        {
            title: 'How do I use it?',
            content: 'Click on each item to expand or collapse it.',
            defaultOpen: false,
        },
    ],
    allowMultiple: false,
    textColor: null,
    margin: null,
    background: null,
    dimensions: null,
    transform: null,
    animation: null,
    customPadding: null,
};
export const AccordionConfig = {
    label: 'Accordion',
    defaultProps,
    render: (props) => (_jsx(AccordionClient, { items: props.items, allowMultiple: props.allowMultiple, textColor: props.textColor, margin: props.margin, background: props.background, dimensions: props.dimensions, transform: props.transform, animation: props.animation, customPadding: props.customPadding })),
};
//# sourceMappingURL=Accordion.server.js.map