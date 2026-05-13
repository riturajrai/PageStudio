'use client';

import React from 'react';
import { Section } from '@/types/page';
import { getSectionComponent } from '@/registry/sectionRegistry';

interface Props {
  sections: Section[];
}

export default function Renderer({ sections }: Props) {
  return (
    <>
      {sections.map((section) => {
        const Component = getSectionComponent(section.type) as React.ComponentType<any>;
        return <Component key={section.id} {...section.props} />;
      })}
    </>
  );
}