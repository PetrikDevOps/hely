import azureData from '$lib/azure.json';
import prisma from '$lib/server/prisma';
import type { CellValue } from 'exceljs';

interface NameAbbreviationRules {
  pattern: RegExp;
  handler: (match: RegExpMatchArray) => string;
}

export class KretaUtil {
  private static readonly MARRIED_SUFFIX = 'né';

  private static replaceHungarianAccents(input: string): string {
    const accentMap: Record<string, string> = {
      á: 'a',
      Á: 'A',
      é: 'e',
      É: 'E',
      í: 'i',
      Í: 'I',
      ó: 'o',
      Ó: 'O',
      ö: 'o',
      Ö: 'O',
      ő: 'o',
      Ő: 'O',
      ú: 'u',
      Ú: 'U',
      ü: 'u',
      Ü: 'U',
      ű: 'u',
      Ű: 'U'
    };

    return input.replace(/[áÁéÉíÍóÓöÖőŐúÚüÜűŰ]/g, (match) => accentMap[match]);
  }

  private static readonly rules: NameAbbreviationRules[] = [
    // Married names with same initial
    {
      pattern: /^([A-ZÁ-Ű][a-zá-ű]+)né\s+([A-ZÁ-Ű][a-zá-ű]+)\s+.+$/,
      handler: (match) => `${match[1]}né`
    },
    // Double last names with hyphen
    {
      pattern: /^([A-ZÁ-Ű][a-zá-ű]+)-([A-ZÁ-Ű][a-zá-ű]+)\s+.+$/,
      handler: (match) => `${match[1]}-${match[2]}`
    },
    // Names with common first letter requiring disambiguation
    {
      pattern: /^([A-ZÁ-Ű][a-zá-ű]+)\s+([A-ZÁ-Ű][a-zá-ű]+)$/,
      handler: (match) => {
        const lastName = match[1];
        const firstName = match[2];
        return lastName[0] === firstName[0] ? `${lastName[0]}${firstName[0]}` : lastName;
      }
    }
  ];

  public static abbreviatePerson(fullName: string): string {
    // Handle empty or invalid input
    if (!fullName?.trim()) {
      return '';
    }

    // Remove extra whitespace and normalize
    const normalizedName = fullName.trim().replace(/\s+/g, ' ');

    // Handle special title cases
    if (normalizedName.toLowerCase().startsWith('dr.')) {
      return `dr ${this.abbreviatePerson(normalizedName.substring(3).trim())}`;
    }

    // Apply rules in sequence
    for (const rule of this.rules) {
      const match = normalizedName.match(rule.pattern);
      if (match) {
        return rule.handler(match);
      }
    }

    // Handle married names (default case)
    if (normalizedName.includes(this.MARRIED_SUFFIX)) {
      const baseName = normalizedName.split(' ')[0];
      return `${baseName}${this.MARRIED_SUFFIX}`;
    }

    // Default: return first word (usually last name)
    const lastName = normalizedName.split(' ')[0];
    return lastName;
  }

  public static abbreviateSubject(fullName: string, takenNames: string[]): string {
    // Special case replacements
    const specialCases = new Map([
      ['gyakorlat', 'gyak'],
      ['fakultáció', 'fakt'],
      ['alapismeretek', 'alapism'],
      ['környezetvédelmi', 'kvéd'],
      ['angol', 'ang'],
      ['projektmunka', 'pr'],
      ['természettudományos', 'ter.tud'],
      ['programming', 'prog'],
      ['laboratory', 'lab'],
      ['technológia', 'tech']
    ]);

    // Handle empty or invalid input
    if (!fullName || typeof fullName !== 'string') {
      return '';
    }

    const words = fullName.split(' ');
    const abbreviated = words.map((word) => {
      // Skip articles and conjunctions
      if (['és', 'a', 'az', 'and', 'the'].includes(word.toLowerCase())) {
        return '';
      }

      // Check for special cases
      for (const [full, short] of specialCases) {
        if (word.toLowerCase().includes(full)) {
          return short;
        }
      }

      // Handle numbers and special characters
      if (/\d+/.test(word)) {
        return word;
      }

      // Handle parentheses content
      if (word.includes('(') && word.includes(')')) {
        return word;
      }

      // Basic abbreviation: first letter or first few letters
      if (word.length <= 4) {
        return word;
      }

      return word.charAt(0).toUpperCase();
    });

    // Filter out empty strings and join
    let result = abbreviated
      .filter((part) => part)
      .join('.')
      .replace(/\.+/g, '.') // Remove multiple consecutive dots
      .replace(/\.$/, ''); // Remove trailing dot

    // Special case handling for subject variations
    if (result.toLowerCase().includes('gy')) {
      result += ' GY';
    }

    if (takenNames.includes(result)) {
      const first = result.split('.')[0];
      const rest = result.split('.').slice(1).join('.');
      return `${first}.${rest[0]}`;
    }

    return result;
  }

  public static parseClassName = (name: string) => {
    const sanitize = (str: string) => {
      return str.toUpperCase().replace('.', '').replace(' ', '').trim();
    };

    if (name.includes('.')) {
      return sanitize(name);
    } else {
      let split = [];
      if (name.includes('_')) {
        split = name.split('_');
      } else {
        split = name.split('-');
      }

      for (const part of split) {
        if (part && /\d/.test(part) && /[A-Z]/.test(part)) {
          // check if we have more than 1 alpha
          const matches = part.match(/[A-Z]/g);
          if (matches && matches.length > 1 && !part.includes('KNY')) {
            // we have a lesson that is held for multiple classes at the same time, return all classes
            const classLetters = part.match(/[A-Z]/g);
            const classNumbers = part.match(/\d/g)?.join('');
            if (!classNumbers || !classLetters) {
              return [];
            }
            const classes = classLetters.map((letter) => classNumbers + letter);
            return classes.map(sanitize);
          }

          return sanitize(part);
        }
      }
    }

    return null;
  };

  public static findEmail = (name: string) => {
    const sanitized = this.replaceHungarianAccents(name.toLowerCase().replace(' ', ''));
    const found = azureData.find(
      (entry) =>
        this.replaceHungarianAccents(entry.displayName).toLowerCase().replace(' ', '') === sanitized
    );
    if (!found && name.split(' ').length > 2) {
      const [firstName, lastName] = name.split(' ');
      const sanitized = this.replaceHungarianAccents(
        `${firstName} ${lastName}`.toLowerCase().replace(' ', '')
      );
      return (
        azureData.find(
          (entry) =>
            this.replaceHungarianAccents(entry.displayName).toLowerCase().replace(' ', '') ===
            sanitized
        )?.mail || null
      );
    }
    if (!found && name.split(' ').length > 1) {
      const [firstName, lastName] = name.split(' ');
      const sanitized = this.replaceHungarianAccents(
        `${firstName} ${lastName.slice(0, -1)}`.toLowerCase().replace(' ', '')
      );
      return (
        azureData.find(
          (entry) =>
            this.replaceHungarianAccents(entry.displayName).toLowerCase().replace(' ', '') ===
            sanitized
        )?.mail || null
      );
    }
    if (!found && name.split(' ').length > 3) {
      const [firstName, middleName, lastName] = name.split(' ');
      const sanitized = this.replaceHungarianAccents(
        `${firstName} ${middleName} ${lastName}`.toLowerCase().replace(' ', '')
      );
      return (
        azureData.find(
          (entry) =>
            this.replaceHungarianAccents(entry.displayName).toLowerCase().replace(' ', '') ===
            sanitized
        )?.mail || null
      );
    }
    if (!found) {
      const [firstName, lastName] = name.split(' ');
      const sanitized = this.replaceHungarianAccents(
        `${firstName} ${lastName[0]}`.toLowerCase().replace(' ', '')
      );
      return (
        azureData.find(
          (entry) =>
            this.replaceHungarianAccents(entry.displayName).toLowerCase().replace(' ', '') ===
            sanitized
        )?.mail || null
      );
    }
    return found?.mail || null;
  };

  public static getClassId = async (className: CellValue, groupName: CellValue) => {
    const name = (className || groupName)?.toString() || '';
    const _class = this.parseClassName(name);
    const allClasses = await prisma.class.findMany();

    if (!_class) {
      return null;
    }

    if (typeof _class === 'object') {
      const foundClasses = allClasses.filter((c) => _class.includes(c.name));
      if (foundClasses.length > 0) {
        return foundClasses.map((c) => c.id);
      }

      return null;
    }

    const found = allClasses.find((c) => c.name === _class);
    if (!found) {
      return null;
    }

    return found.id;
  };

  private static readonly SPECIAL_ROOMS = new Map([
    ['testnevelés1', 'As007'],
    ['testnevelés2', 'kistesi'],
    ['testnevelés3', 'nagytesi'],
    ['testnevelés3*', 'udvar'],
    ['testnevelés4', 'uszoda'],
    ['testnevelés4*', 'külső'],
    ['Petrik Előadó', 'Petrik EA'],
    ['B210-211', 'B. II. EA'],
    ['Györgyi Tamás A', 'GYT A'],
    ['Györgyi Tamás B', 'GYT B']
  ]);

  private static readonly PATTERNS = [
    // Special purpose room with underscore
    {
      test: (name: string) => name.includes('_'),
      abbreviate: (name: string) => name // Keep as is
    },
    // Combined rooms with hyphen
    {
      test: (name: string) => /^[AB]\d+-\d+$/.test(name),
      abbreviate: (name: string) => name // Keep as is
    },
    // Standard room numbers
    {
      test: (name: string) => /^[AB][s]?\d+[A-Z]?$/.test(name),
      abbreviate: (name: string) => name // Keep as is
    },
    // Rooms with additional description
    {
      test: (name: string) => name.includes(' - '),
      abbreviate: (name: string) => name.split(' - ')[0]
    },
    // Rooms with type suffix
    {
      test: (name: string) => name.includes(' tárgyaló'),
      abbreviate: (name: string) => name // Keep full name
    }
  ];

  public static abbreviateRoom(fullName: string): string {
    // Handle empty or invalid input
    if (!fullName?.trim()) {
      return '';
    }

    const normalizedName = fullName.trim();

    // Check special rooms first
    if (this.SPECIAL_ROOMS.has(normalizedName)) {
      return this.SPECIAL_ROOMS.get(normalizedName)!;
    }

    // Apply patterns in sequence
    for (const pattern of this.PATTERNS) {
      if (pattern.test(normalizedName)) {
        return pattern.abbreviate(normalizedName);
      }
    }

    // Default: return original name if no patterns match
    return normalizedName;
  }

  public static getWeekType = (value: CellValue) => {
    switch (value) {
      case 'Minden héten':
        return 'AB';
      case 'A hét':
        return 'A';
      case 'B hét':
        return 'B';
      case 'Szünet':
        return 'X';
      default:
        return null;
    }
  };

  public static getWeekDay = (value: CellValue) => {
    switch (value) {
      case 'Hétfő':
        return 'Monday';
      case 'Kedd':
        return 'Tuesday';
      case 'Szerda':
        return 'Wednesday';
      case 'Csütörtök':
        return 'Thursday';
      case 'Péntek':
        return 'Friday';
      case 'Szombat':
        return 'Saturday';
      case 'Vasárnap':
        return 'Sunday';
      default:
        return null;
    }
  };
}
