import { expect, it } from 'vitest';
import { skillIdentity } from './skills.ts';

it('requires one usable description and an identity matching the repository folder', () => {
  const good = '---\r\nname: task-lifecycle\r\ndescription: Review an approved task.\r\n---\r\n';
  expect(skillIdentity('task-lifecycle', good)).toBe('task-lifecycle');
  expect(skillIdentity('issues', good)).toBeUndefined();
  expect(skillIdentity('task-lifecycle', good.replace('description:', 'title:'))).toBeUndefined();
  expect(
    skillIdentity(
      'task-lifecycle',
      good.replace('description:', 'name: duplicate\r\ndescription:'),
    ),
  ).toBeUndefined();
});
