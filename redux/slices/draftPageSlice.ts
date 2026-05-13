import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PageData, Section, SectionType } from '@/types/page';
import { v4 as uuidv4 } from 'uuid';

interface DraftState extends PageData {
  isDirty: boolean;
}

const initialState: DraftState = {
  pageId: '',
  slug: '',
  title: '',
  sections: [],
  isDirty: false,
};

const draftPageSlice = createSlice({
  name: 'draftPage',
  initialState,
  reducers: {
    loadDraft: (state, action: PayloadAction<PageData>) => {
      return {
        ...action.payload,
        isDirty: false,
      };
    },

    addSection: (state, action: PayloadAction<SectionType>) => {
      state.sections.push({
        id: uuidv4(),
        type: action.payload,
        props: {},
      });

      state.isDirty = true;
    },

    removeSection: (state, action: PayloadAction<string>) => {
      state.sections = state.sections.filter(
        section => section.id !== action.payload
      );

      state.isDirty = true;
    },

    reorderSections: (state, action: PayloadAction<Section[]>) => {
      state.sections = action.payload;
      state.isDirty = true;
    },

    updateSectionProps: (
      state,
      action: PayloadAction<{
        id: string;
        props: Record<string, any>;
      }>
    ) => {
      const section = state.sections.find(
        s => s.id === action.payload.id
      );

      if (section) {
        section.props = {
          ...section.props,
          ...action.payload.props,
        };
      }

      state.isDirty = true;
    },

    setPageTitle: (state, action: PayloadAction<string>) => {
      state.title = action.payload;
      state.isDirty = true;
    },
  },
});

export const {
  loadDraft,
  addSection,
  removeSection,
  reorderSections,
  updateSectionProps,
  setPageTitle,
} = draftPageSlice.actions;

export default draftPageSlice.reducer;