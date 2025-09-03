

export interface BaremoEntry {
    scoreRange: string;
    ds: string;
    interpretation: 'Normal' | 'Normal Lento' | 'Riesgo' | 'Déficit' | 'Sin estructura' | 'Transición' | 'Estructura I' | 'Estructura II' | 'Estructura III' | 'Normal Alto' | 'Muy buen desarrollo' | 'Sobresaliente' | 'Normal bajo' | 'Retraso o Dificultad' | 'Dentro de los límites normales' | 'Leve' | 'Moderado' | 'Severo';
    min: number;
    max: number;
}
  
export interface AgeBaremo {
    ageRange: {
        from: { years: number; months: number };
        to: { years: number; months: number };
    };
    baremo: BaremoEntry[];
}

export interface StandardizedTest {
    id: string;
    name: string;
    area: string;
    baremos: AgeBaremo[];
}

export const tests: StandardizedTest[] = [
    {
      id: 'boston_standard',
      name: 'Test de Boston para la Denominación (Estándar)',
      area: 'Lenguaje Expresivo - Denominación',
      baremos: [
          {
              ageRange: { from: { years: 18, months: 0 }, to: { years: 100, months: 0 } },
              baremo: [
                  { scoreRange: '56-60', ds: 'Percentil >75', interpretation: 'Dentro de los límites normales', min: 56, max: 60 },
                  { scoreRange: '50-55', ds: 'Percentil 25-75', interpretation: 'Dentro de los límites normales', min: 50, max: 55 },
                  { scoreRange: '45-49', ds: 'Percentil 10-24', interpretation: 'Leve', min: 45, max: 49 },
                  { scoreRange: '40-44', ds: 'Percentil 5-9', interpretation: 'Moderado', min: 40, max: 44 },
                  { scoreRange: '<40', ds: 'Percentil <5', interpretation: 'Severo', min: 0, max: 39 },
              ]
          },
      ]
    },
    {
      id: 'boston_abbreviated',
      name: 'Test de Boston para la Denominación (Abreviado)',
      area: 'Lenguaje Expresivo - Denominación',
      baremos: [
           {
              ageRange: { from: { years: 18, months: 0 }, to: { years: 100, months: 0 } },
              baremo: [
                  { scoreRange: '14-15', ds: 'Percentil >75', interpretation: 'Dentro de los límites normales', min: 14, max: 15 },
                  { scoreRange: '12-13', ds: 'Percentil 25-75', interpretation: 'Dentro de los límites normales', min: 12, max: 13 },
                  { scoreRange: '10-11', ds: 'Percentil 10-24', interpretation: 'Leve', min: 10, max: 11 },
                  { scoreRange: '8-9', ds: 'Percentil 5-9', interpretation: 'Moderado', min: 8, max: 9 },
                  { scoreRange: '<8', ds: 'Percentil <5', interpretation: 'Severo', min: 0, max: 7 },
              ]
          },
      ]
    },
    {
      id: 'reel',
      name: 'REEL',
      area: 'Lenguaje Receptivo-Expresivo',
      baremos: [
        {
          ageRange: { from: { years: 0, months: 0 }, to: { years: 3, months: 0 } },
          baremo: [] // REEL no usa baremos de puntaje directo, su lógica es diferente.
        }
      ]
    },
    {
      id: 'tecal_total',
      name: 'TECAL (Total)',
      area: 'Comprensión',
      baremos: [
        {
          ageRange: { from: { years: 3, months: 0 }, to: { years: 3, months: 11 } },
          baremo: [
            { scoreRange: '> 58', ds: '> +1 DS', interpretation: 'Normal', min: 59, max: 101 },
            { scoreRange: '46-58', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 46, max: 58 },
            { scoreRange: '39-45', ds: '-1 DS a X', interpretation: 'Riesgo', min: 39, max: 45 },
            { scoreRange: '< 39', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 38 },
          ]
        },
        {
          ageRange: { from: { years: 4, months: 0 }, to: { years: 4, months: 11 } },
          baremo: [
            { scoreRange: '> 72', ds: '> +1 DS', interpretation: 'Normal', min: 73, max: 101 },
            { scoreRange: '54-72', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 54, max: 72 },
            { scoreRange: '45-53', ds: '-1 DS a X', interpretation: 'Riesgo', min: 45, max: 53 },
            { scoreRange: '< 45', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 44 },
          ]
        },
        {
          ageRange: { from: { years: 5, months: 0 }, to: { years: 5, months: 11 } },
          baremo: [
            { scoreRange: '> 89', ds: '> +1 DS', interpretation: 'Normal', min: 90, max: 101 },
            { scoreRange: '78-89', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 78, max: 89 },
            { scoreRange: '72-77', ds: '-1 DS a X', interpretation: 'Riesgo', min: 72, max: 77 },
            { scoreRange: '< 72', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 71 },
          ]
        },
        {
          ageRange: { from: { years: 6, months: 0 }, to: { years: 6, months: 11 } },
          baremo: [
            { scoreRange: '> 95', ds: '> +1 DS', interpretation: 'Normal', min: 96, max: 101 },
            { scoreRange: '84-95', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 84, max: 95 },
            { scoreRange: '79-83', ds: '-1 DS a X', interpretation: 'Riesgo', min: 79, max: 83 },
            { scoreRange: '< 79', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 78 },
          ]
        },
      ],
    },
    {
        id: 'tecal_vocabulario',
        name: 'TECAL (Vocabulario)',
        area: 'Comprensión',
        baremos: [
           {
             ageRange: { from: { years: 3, months: 0 }, to: { years: 3, months: 11 } },
             baremo: [
               { scoreRange: '29-37', ds: '> +1 DS', interpretation: 'Normal', min: 29, max: 37 },
               { scoreRange: '21-28', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 21, max: 28 },
               { scoreRange: '13-20', ds: '-1 DS a X', interpretation: 'Riesgo', min: 13, max: 20 },
               { scoreRange: '0-12', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 12 },
             ]
           },
           {
             ageRange: { from: { years: 4, months: 0 }, to: { years: 4, months: 11 } },
             baremo: [
               { scoreRange: '34-40', ds: '> +1 DS', interpretation: 'Normal', min: 34, max: 40 },
               { scoreRange: '30-33', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 30, max: 33 },
               { scoreRange: '26-29', ds: '-1 DS a X', interpretation: 'Riesgo', min: 26, max: 29 },
               { scoreRange: '0-25', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 25 },
             ]
           },
           {
             ageRange: { from: { years: 5, months: 0 }, to: { years: 5, months: 11 } },
             baremo: [
               { scoreRange: '36-41', ds: '> +1 DS', interpretation: 'Normal', min: 36, max: 41 },
               { scoreRange: '32-35', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 32, max: 35 },
               { scoreRange: '28-31', ds: '-1 DS a X', interpretation: 'Riesgo', min: 28, max: 31 },
               { scoreRange: '0-27', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 27 },
             ]
           },
           {
             ageRange: { from: { years: 6, months: 0 }, to: { years: 6, months: 11 } },
             baremo: [
               { scoreRange: '36-41', ds: '> +1 DS', interpretation: 'Normal', min: 36, max: 41 },
               { scoreRange: '33-35', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 33, max: 35 },
               { scoreRange: '30-32', ds: '-1 DS a X', interpretation: 'Riesgo', min: 30, max: 32 },
               { scoreRange: '0-29', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 29 },
             ]
           },
        ]
    },
    {
        id: 'tecal_morfologia',
        name: 'TECAL (Morfología)',
        area: 'Comprensión',
        baremos: [
           {
             ageRange: { from: { years: 3, months: 0 }, to: { years: 3, months: 11 } },
             baremo: [
               { scoreRange: '31-38', ds: '> +1 DS', interpretation: 'Normal', min: 31, max: 38 },
               { scoreRange: '26-30', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 26, max: 30 },
               { scoreRange: '21-25', ds: '-1 DS a X', interpretation: 'Riesgo', min: 21, max: 25 },
               { scoreRange: '0-20', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 20 },
             ]
           },
            {
             ageRange: { from: { years: 4, months: 0 }, to: { years: 4, months: 11 } },
             baremo: [
               { scoreRange: '33-39', ds: '> +1 DS', interpretation: 'Normal', min: 33, max: 39 },
               { scoreRange: '29-32', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 29, max: 32 },
               { scoreRange: '25-28', ds: '-1 DS a X', interpretation: 'Riesgo', min: 25, max: 28 },
               { scoreRange: '0-24', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 24 },
             ]
           },
           {
             ageRange: { from: { years: 5, months: 0 }, to: { years: 5, months: 11 } },
             baremo: [
               { scoreRange: '33-39', ds: '> +1 DS', interpretation: 'Normal', min: 33, max: 39 },
               { scoreRange: '30-32', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 30, max: 32 },
               { scoreRange: '27-29', ds: '-1 DS a X', interpretation: 'Riesgo', min: 27, max: 29 },
               { scoreRange: '0-26', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 26 },
             ]
           },
           {
             ageRange: { from: { years: 6, months: 0 }, to: { years: 6, months: 11 } },
             baremo: [
               { scoreRange: '34-39', ds: '> +1 DS', interpretation: 'Normal', min: 34, max: 39 },
               { scoreRange: '31-33', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 31, max: 33 },
               { scoreRange: '28-30', ds: '-1 DS a X', interpretation: 'Riesgo', min: 28, max: 30 },
               { scoreRange: '0-27', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 27 },
             ]
           },
        ]
    },
    {
        id: 'tecal_sintaxis',
        name: 'TECAL (Sintaxis)',
        area: 'Comprensión',
        baremos: [
           {
             ageRange: { from: { years: 3, months: 0 }, to: { years: 3, months: 11 } },
             baremo: [
               { scoreRange: '25-34', ds: '> +1 DS', interpretation: 'Normal', min: 25, max: 34 },
               { scoreRange: '20-24', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 20, max: 24 },
               { scoreRange: '15-19', ds: '-1 DS a X', interpretation: 'Riesgo', min: 15, max: 19 },
               { scoreRange: '0-14', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 14 },
             ]
           },
           {
             ageRange: { from: { years: 4, months: 0 }, to: { years: 4, months: 11 } },
             baremo: [
               { scoreRange: '28-36', ds: '> +1 DS', interpretation: 'Normal', min: 28, max: 36 },
               { scoreRange: '24-27', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 24, max: 27 },
               { scoreRange: '20-23', ds: '-1 DS a X', interpretation: 'Riesgo', min: 20, max: 23 },
               { scoreRange: '0-19', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 19 },
             ]
           },
           {
             ageRange: { from: { years: 5, months: 0 }, to: { years: 5, months: 11 } },
             baremo: [
               { scoreRange: '31-36', ds: '> +1 DS', interpretation: 'Normal', min: 31, max: 36 },
               { scoreRange: '27-30', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 27, max: 30 },
               { scoreRange: '23-26', ds: '-1 DS a X', interpretation: 'Riesgo', min: 23, max: 26 },
               { scoreRange: '0-22', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 22 },
             ]
           },
           {
             ageRange: { from: { years: 6, months: 0 }, to: { years: 6, months: 11 } },
             baremo: [
               { scoreRange: '31-35', ds: '> +1 DS', interpretation: 'Normal', min: 31, max: 35 },
               { scoreRange: '27-30', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 27, max: 30 },
               { scoreRange: '23-26', ds: '-1 DS a X', interpretation: 'Riesgo', min: 23, max: 26 },
               { scoreRange: '0-22', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 22 },
             ]
           },
        ]
    },
    {
      id: 'teprolif-r-repeticion',
      name: 'TEPROSIF-R (Repetición)',
      area: 'Habla',
      baremos: [
        {
          ageRange: { from: { years: 3, months: 0 }, to: { years: 6, months: 11 } }, // Assuming one range for now
          baremo: [
            { scoreRange: '33 - 37', ds: '> +1 DS', interpretation: 'Normal', min: 33, max: 37 },
            { scoreRange: '27 - 32', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 27, max: 32 },
            { scoreRange: '21 - 26', ds: '-1 DS a X', interpretation: 'Riesgo', min: 21, max: 26 },
            { scoreRange: '0 - 20', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 20 },
          ],
        }
      ],
    },
    {
      id: 'stsg-expresivo',
      name: 'STSG (Expresivo)',
      area: 'Lenguaje',
      baremos: [
        {
            ageRange: { from: { years: 3, months: 0 }, to: { years: 3, months: 11 } },
            baremo: [
                { scoreRange: '> 30', ds: '> +1 DS', interpretation: 'Normal', min: 31, max: 44 },
                { scoreRange: '15-30', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 15, max: 30 },
                { scoreRange: '8-14', ds: '-1 DS a X', interpretation: 'Riesgo', min: 8, max: 14 },
                { scoreRange: '< 8', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 7 },
            ],
        },
        {
            ageRange: { from: { years: 4, months: 0 }, to: { years: 4, months: 11 } },
            baremo: [
                { scoreRange: '> 36', ds: '> +1 DS', interpretation: 'Normal', min: 37, max: 44 },
                { scoreRange: '21-36', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 21, max: 36 },
                { scoreRange: '14-20', ds: '-1 DS a X', interpretation: 'Riesgo', min: 14, max: 20 },
                { scoreRange: '< 14', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 13 },
            ],
        },
        {
            ageRange: { from: { years: 5, months: 0 }, to: { years: 5, months: 11 } },
            baremo: [
                { scoreRange: '> 41', ds: '> +1 DS', interpretation: 'Normal', min: 42, max: 44 },
                { scoreRange: '29-41', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 29, max: 41 },
                { scoreRange: '23-28', ds: '-1 DS a X', interpretation: 'Riesgo', min: 23, max: 28 },
                { scoreRange: '< 23', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 22 },
            ],
        },
        {
            ageRange: { from: { years: 6, months: 0 }, to: { years: 7, months: 11 } },
            baremo: [
                { scoreRange: '> 43', ds: '> +1 DS', interpretation: 'Normal', min: 44, max: 44 },
                { scoreRange: '36-43', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 36, max: 43 },
                { scoreRange: '32-35', ds: '-1 DS a X', interpretation: 'Riesgo', min: 32, max: 35 },
                { scoreRange: '< 32', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 31 },
            ],
        },
      ],
    },
    {
      id: 'stsg-comprensivo',
      name: 'STSG (Receptivo)',
      area: 'Lenguaje',
      baremos: [
        {
            ageRange: { from: { years: 3, months: 0 }, to: { years: 3, months: 11 } },
            baremo: [
                { scoreRange: '> 35', ds: '> +1 DS', interpretation: 'Normal', min: 36, max: 44 },
                { scoreRange: '24-35', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 24, max: 35 },
                { scoreRange: '19-23', ds: '-1 DS a X', interpretation: 'Riesgo', min: 19, max: 23 },
                { scoreRange: '< 19', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 18 },
            ],
        },
        {
            ageRange: { from: { years: 4, months: 0 }, to: { years: 4, months: 11 } },
            baremo: [
                { scoreRange: '> 37', ds: '> +1 DS', interpretation: 'Normal', min: 38, max: 44 },
                { scoreRange: '29-37', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 29, max: 37 },
                { scoreRange: '25-28', ds: '-1 DS a X', interpretation: 'Riesgo', min: 25, max: 28 },
                { scoreRange: '< 25', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 24 },
            ],
        },
        {
            ageRange: { from: { years: 5, months: 0 }, to: { years: 5, months: 11 } },
            baremo: [
                { scoreRange: '> 42', ds: '> +1 DS', interpretation: 'Normal', min: 43, max: 44 },
                { scoreRange: '34-42', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 34, max: 42 },
                { scoreRange: '30-33', ds: '-1 DS a X', interpretation: 'Riesgo', min: 30, max: 33 },
                { scoreRange: '< 30', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 29 },
            ],
        },
        {
            ageRange: { from: { years: 6, months: 0 }, to: { years: 7, months: 11 } },
            baremo: [
                { scoreRange: '> 44', ds: '> +1 DS', interpretation: 'Normal', min: 45, max: 44 }, // Note: Max is 44, so >43
                { scoreRange: '37-44', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 37, max: 44 },
                { scoreRange: '33-36', ds: '-1 DS a X', interpretation: 'Riesgo', min: 33, max: 36 },
                { scoreRange: '< 33', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 32 },
            ],
        },
      ],
    },
    {
      id: 'itpa-r',
      name: 'ITPA-R',
      area: 'Psicolingüístico',
      baremos: [
        {
            ageRange: { from: { years: 3, months: 0 }, to: { years: 3, months: 5 } },
            baremo: [
                { scoreRange: '38-56', ds: '> +1 DS', interpretation: 'Normal', min: 38, max: 56 },
                { scoreRange: '33-37', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 33, max: 37 },
                { scoreRange: '28-32', ds: '-1 DS a X', interpretation: 'Riesgo', min: 28, max: 32 },
                { scoreRange: '0-27', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 27 },
            ]
        },
        {
            ageRange: { from: { years: 10, months: 0 }, to: { years: 10, months: 11 } },
            baremo: [
                { scoreRange: '40-56', ds: '> +1 DS', interpretation: 'Normal', min: 40, max: 56 },
                { scoreRange: '35-39', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 35, max: 39 },
                { scoreRange: '30-34', ds: '-1 DS a X', interpretation: 'Riesgo', min: 30, max: 34 },
                { scoreRange: '0-29', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 29 },
            ]
        }
      ]
    },
    {
      id: 'tevi-r',
      name: 'TEVI-R',
      area: 'Vocabulario Pasivo',
      baremos: [
        {
          ageRange: { from: { years: 2, months: 6 }, to: { years: 17, months: 0 } },
          baremo: [
            { scoreRange: '60-116', ds: 'Normal Alto', interpretation: 'Normal Alto', min: 60, max: 116 },
            { scoreRange: '41-59', ds: 'Normal', interpretation: 'Normal', min: 41, max: 59 },
            { scoreRange: '30-40', ds: 'Riesgo', interpretation: 'Riesgo', min: 30, max: 40 },
            { scoreRange: '0-29', ds: 'Déficit', interpretation: 'Déficit', min: 0, max: 29 },
          ],
        },
      ]
    },
    {
      id: 'idtel_total',
      name: 'IDTEL (Total)',
      area: 'Lenguaje',
      baremos: [
        {
            ageRange: { from: { years: 6, months: 0 }, to: { years: 9, months: 11 } },
            baremo: [
                { scoreRange: '56-60', ds: '> +1 DS', interpretation: 'Normal', min: 56, max: 60 },
                { scoreRange: '46-55', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 46, max: 55 },
                { scoreRange: '36-45', ds: '-1 DS a X', interpretation: 'Riesgo', min: 36, max: 45 },
                { scoreRange: '0-35', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 35 },
            ]
        },
      ]
    },
     {
      id: 'idtel_vocabulario_activo',
      name: 'IDTEL (Vocabulario Activo)',
      area: 'Lenguaje',
      baremos: [
        {
            ageRange: { from: { years: 6, months: 0 }, to: { years: 9, months: 11 } },
            baremo: [
                { scoreRange: '10-12', ds: '> +1 DS', interpretation: 'Normal', min: 10, max: 12 },
                { scoreRange: '8-9', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 8, max: 9 },
                { scoreRange: '6-7', ds: '-1 DS a X', interpretation: 'Riesgo', min: 6, max: 7 },
                { scoreRange: '0-5', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 5 },
            ]
        },
      ]
    },
     {
      id: 'idtel_memoria_de_trabajo',
      name: 'IDTEL (Memoria de Trabajo)',
      area: 'Lenguaje',
      baremos: [
        {
            ageRange: { from: { years: 6, months: 0 }, to: { years: 9, months: 11 } },
            baremo: [
                { scoreRange: '9-12', ds: '> +1 DS', interpretation: 'Normal', min: 9, max: 12 },
                { scoreRange: '7-8', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 7, max: 8 },
                { scoreRange: '5-6', ds: '-1 DS a X', interpretation: 'Riesgo', min: 5, max: 6 },
                { scoreRange: '0-4', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 4 },
            ]
        },
      ]
    },
    {
      id: 'idtel_meta_semantico',
      name: 'IDTEL (Meta-Semántico)',
      area: 'Lenguaje',
      baremos: [
        {
            ageRange: { from: { years: 6, months: 0 }, to: { years: 9, months: 11 } },
            baremo: [
                { scoreRange: '11-12', ds: '> +1 DS', interpretation: 'Normal', min: 11, max: 12 },
                { scoreRange: '9-10', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 9, max: 10 },
                { scoreRange: '7-8', ds: '-1 DS a X', interpretation: 'Riesgo', min: 7, max: 8 },
                { scoreRange: '0-6', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 6 },
            ]
        },
      ]
    },
    {
      id: 'idtel_meta_fonologico',
      name: 'IDTEL (Meta-Fonológico)',
      area: 'Lenguaje',
      baremos: [
        {
            ageRange: { from: { years: 6, months: 0 }, to: { years: 9, months: 11 } },
            baremo: [
                { scoreRange: '12', ds: '> +1 DS', interpretation: 'Normal', min: 12, max: 12 },
                { scoreRange: '10-11', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 10, max: 11 },
                { scoreRange: '8-9', ds: '-1 DS a X', interpretation: 'Riesgo', min: 8, max: 9 },
                { scoreRange: '0-7', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 7 },
            ]
        },
      ]
    },
    {
      id: 'idtel_meta_sintactico',
      name: 'IDTEL (Meta-Sintáctico)',
      area: 'Lenguaje',
      baremos: [
        {
            ageRange: { from: { years: 6, months: 0 }, to: { years: 9, months: 11 } },
            baremo: [
                { scoreRange: '12', ds: '> +1 DS', interpretation: 'Normal', min: 12, max: 12 },
                { scoreRange: '10-11', ds: 'X a +1 DS', interpretation: 'Normal Lento', min: 10, max: 11 },
                { scoreRange: '8-9', ds: '-1 DS a X', interpretation: 'Riesgo', min: 8, max: 9 },
                { scoreRange: '0-7', ds: '< -1 DS', interpretation: 'Déficit', min: 0, max: 7 },
            ]
        },
      ]
    },
    {
      id: 'edna_cualitativo',
      name: 'EDNA (Cualitativo)',
      area: 'Discurso',
      baremos: [
        {
          ageRange: { from: { years: 3, months: 0 }, to: { years: 10, months: 11 } },
          baremo: [
            { scoreRange: '1', ds: 'Nivel 1', interpretation: 'Sin estructura', min: 1, max: 1 },
            { scoreRange: '2', ds: 'Nivel 2', interpretation: 'Sin estructura', min: 2, max: 2 },
            { scoreRange: '3', ds: 'Nivel 3', interpretation: 'Sin estructura', min: 3, max: 3 },
            { scoreRange: '4', ds: 'Nivel 4', interpretation: 'Sin estructura', min: 4, max: 4 },
            { scoreRange: '5', ds: 'Nivel 5', interpretation: 'Transición', min: 5, max: 5 },
            { scoreRange: '6', ds: 'Nivel 6', interpretation: 'Transición', min: 6, max: 6 },
            { scoreRange: '7', ds: 'Nivel 7', interpretation: 'Estructura I', min: 7, max: 7 },
            { scoreRange: '8', ds: 'Nivel 8', interpretation: 'Estructura I', min: 8, max: 8 },
            { scoreRange: '9', ds: 'Nivel 9', interpretation: 'Estructura II', min: 9, max: 9 },
            { scoreRange: '10', ds: 'Nivel 10', interpretation: 'Estructura II', min: 10, max: 10 },
            { scoreRange: '11', ds: 'Nivel 11', interpretation: 'Estructura III', min: 11, max: 11 },
            { scoreRange: '12', ds: 'Nivel 12', interpretation: 'Estructura III', min: 12, max: 12 },
            { scoreRange: '13', ds: 'Nivel 13', interpretation: 'Estructura III', min: 13, max: 13 },
          ],
        },
      ]
    },
    {
        id: 'edna_cuantitativo',
        name: 'EDNA (Cuantitativo)',
        area: 'Discurso',
        baremos: [
            {
                ageRange: { from: { years: 4, months: 0 }, to: { years: 4, months: 11 } },
                baremo: [
                    { scoreRange: '> 14', ds: '>p90', interpretation: 'Sobresaliente', min: 15, max: 100 },
                    { scoreRange: '12-14', ds: 'p75-p90', interpretation: 'Muy buen desarrollo', min: 12, max: 14 },
                    { scoreRange: '4-11', ds: 'p25-p74', interpretation: 'Normal', min: 4, max: 11 },
                    { scoreRange: '2-3', ds: 'p10-p24', interpretation: 'Normal bajo', min: 2, max: 3 },
                    { scoreRange: '<= 1', ds: '<=p10', interpretation: 'Déficit', min: 0, max: 1 },
                ]
            },
            {
                ageRange: { from: { years: 5, months: 0 }, to: { years: 5, months: 11 } },
                baremo: [
                    { scoreRange: '> 18', ds: '>p90', interpretation: 'Sobresaliente', min: 19, max: 100 },
                    { scoreRange: '16-18', ds: 'p75-p90', interpretation: 'Muy buen desarrollo', min: 16, max: 18 },
                    { scoreRange: '6-15', ds: 'p25-p74', interpretation: 'Normal', min: 6, max: 15 },
                    { scoreRange: '2-5', ds: 'p10-p24', interpretation: 'Normal bajo', min: 2, max: 5 },
                    { scoreRange: '<= 1', ds: '<=p10', interpretation: 'Déficit', min: 0, max: 1 },
                ]
            },
            {
                ageRange: { from: { years: 6, months: 0 }, to: { years: 6, months: 11 } },
                baremo: [
                    { scoreRange: '> 18', ds: '>p90', interpretation: 'Sobresaliente', min: 19, max: 100 },
                    { scoreRange: '17-18', ds: 'p75-p90', interpretation: 'Muy buen desarrollo', min: 17, max: 18 },
                    { scoreRange: '11-16', ds: 'p25-p74', interpretation: 'Normal', min: 11, max: 16 },
                    { scoreRange: '9-10', ds: 'p10-p24', interpretation: 'Normal bajo', min: 9, max: 10 },
                    { scoreRange: '<= 8', ds: '<=p10', interpretation: 'Déficit', min: 0, max: 8 },
                ]
            },
            {
                ageRange: { from: { years: 10, months: 0 }, to: { years: 11, months: 11 } },
                baremo: [
                    { scoreRange: '> 23', ds: '>p90', interpretation: 'Sobresaliente', min: 24, max: 100 },
                    { scoreRange: '22-23', ds: 'p75-p90', interpretation: 'Muy buen desarrollo', min: 22, max: 23 },
                    { scoreRange: '18-21', ds: 'p25-p74', interpretation: 'Normal', min: 18, max: 21 },
                    { scoreRange: '15-17', ds: 'p10-p24', interpretation: 'Normal bajo', min: 15, max: 17 },
                    { scoreRange: '<= 14', ds: '<=p10', interpretation: 'Déficit', min: 0, max: 14 },
                ]
            }
        ]
    }
];
