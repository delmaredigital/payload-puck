'use client'

/**
 * Email Puck configuration - Editor
 *
 * Full interactive editor experience with field factories.
 * Use with PuckEditor for email building.
 */

import type { Config as PuckConfig, ComponentConfig } from '@puckeditor/core'
import type { ReactNode } from 'react'
import { createColorPickerField } from '../fields/ColorPickerField.js'
import { WEB_SAFE_FONTS } from '../components/email/utils.js'

// Layout
import { EmailWrapperEditorConfig } from '../components/email/EmailWrapper/EmailWrapper.editor.js'
import { EmailSectionEditorConfig } from '../components/email/EmailSection/EmailSection.editor.js'
import { EmailColumnsEditorConfig } from '../components/email/EmailColumns/EmailColumns.editor.js'

// Content
import { EmailTextEditorConfig } from '../components/email/EmailText/EmailText.editor.js'
import { EmailHeadingEditorConfig } from '../components/email/EmailHeading/EmailHeading.editor.js'
import { EmailImageEditorConfig } from '../components/email/EmailImage/EmailImage.editor.js'
import { EmailButtonEditorConfig } from '../components/email/EmailButton/EmailButton.editor.js'

// Utility
import { EmailSpacerEditorConfig } from '../components/email/EmailSpacer/EmailSpacer.editor.js'
import { EmailDividerEditorConfig } from '../components/email/EmailDivider/EmailDivider.editor.js'

// Prebuilt
import { EmailHeaderEditorConfig } from '../components/email/EmailHeader/EmailHeader.editor.js'
import { EmailFooterEditorConfig } from '../components/email/EmailFooter/EmailFooter.editor.js'
import { EmailSocialEditorConfig } from '../components/email/EmailSocial/EmailSocial.editor.js'
import { withBlockVisibility } from '../visibility/withBlockVisibility.js'

export const emailEditorConfig = withBlockVisibility({
  root: {
    fields: {
      subject: { type: 'text', label: 'Subject Line' },
      previewText: { type: 'textarea', label: 'Preview Text' },
      backgroundColor: createColorPickerField({ label: 'Background Color' }),
      fontFamily: {
        type: 'select',
        label: 'Font Family',
        options: WEB_SAFE_FONTS.map(({ label, value }) => ({ label, value })),
      },
      maxWidth: {
        type: 'number',
        label: 'Max Width (px)',
        min: 400,
        max: 900,
      },
    },
    defaultProps: {
      subject: '',
      previewText: '',
      backgroundColor: { hex: '#f4f4f4' },
      fontFamily: 'Arial, Helvetica, sans-serif',
      maxWidth: 600,
    },
    render: ({ children }: { children: ReactNode }) => <>{children}</>,
  },
  categories: {
    layout: {
      title: 'Layout',
      components: ['EmailWrapper', 'EmailSection', 'EmailColumns'],
      defaultExpanded: true,
    },
    content: {
      title: 'Content',
      components: ['EmailText', 'EmailHeading', 'EmailImage', 'EmailButton'],
    },
    utility: {
      title: 'Utility',
      components: ['EmailSpacer', 'EmailDivider'],
    },
    prebuilt: {
      title: 'Prebuilt',
      components: ['EmailHeader', 'EmailFooter', 'EmailSocial'],
    },
  },
  components: {
    EmailWrapper: EmailWrapperEditorConfig as ComponentConfig<any>,
    EmailSection: EmailSectionEditorConfig as ComponentConfig<any>,
    EmailColumns: EmailColumnsEditorConfig as ComponentConfig<any>,
    EmailText: EmailTextEditorConfig as ComponentConfig<any>,
    EmailHeading: EmailHeadingEditorConfig as ComponentConfig<any>,
    EmailImage: EmailImageEditorConfig as ComponentConfig<any>,
    EmailButton: EmailButtonEditorConfig as ComponentConfig<any>,
    EmailSpacer: EmailSpacerEditorConfig as ComponentConfig<any>,
    EmailDivider: EmailDividerEditorConfig as ComponentConfig<any>,
    EmailHeader: EmailHeaderEditorConfig as ComponentConfig<any>,
    EmailFooter: EmailFooterEditorConfig as ComponentConfig<any>,
    EmailSocial: EmailSocialEditorConfig as ComponentConfig<any>,
  },
} satisfies PuckConfig, { screenSizes: false })
