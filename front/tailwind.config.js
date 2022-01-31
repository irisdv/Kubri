module.exports = {
    mode: 'jit',
    content: [
        './src/**/*.{js,ts,jsx,tsx}'
    ],
    plugins: [
        require('daisyui')
    ],

    // config (optional)
    daisyui: {
      themes: [
      {
        'kubri': {                          /* your theme name */
           'primary' : '#5F5DBD',           /* Primary color */
           'primary-focus' : '#390079',     /* Primary color - focused */
           'primary-content' : '#ffffff',   /* Foreground content color to use on primary color */

           'secondary' : '#9D95CB',         /* Secondary color */
           'secondary-focus' : '#9D95CB',   /* Secondary color - focused */
           'secondary-content' : '#ffffff', /* Foreground content color to use on secondary color */

           'accent' : '#00C898',            /* Accent color */
           'accent-focus' : '#00C898',      /* Accent color - focused */
           'accent-content' : '#ffffff',    /* Foreground content color to use on accent color */

           'neutral' : '#F3ECFF',           /* Neutral color */
           'neutral-focus' : '#2a2e37',     /* Neutral color - focused */
           'neutral-content' : '#ffffff',   /* Foreground content color to use on neutral color */

           'base-100' : '#ffffff',          /* Base color of page, used for blank backgrounds */
           'base-200' : '#f9fafb',          /* Base color, a little darker */
           'base-300' : '#d1d5db',          /* Base color, even more darker */
           'base-content' : '#1f2937',      /* Foreground content color to use on base color */

           'info' : '#9D95CB',              /* Info */
           'success' : '#FE0000',           /* Success */
           'warning' : '#ff9900',           /* Warning */
           'error' : '#ff9900',             /* Error */
        },
      },
    {
      extend: {
        boxShadow: {
          blue: '0 4px 14px 0 rgba(19, 51, 81, 0.39)',
        }
      }
    }
    ],
    fontSize: {
    //   // sm: ['14px', '20px'],
    //   // base: ['16px', '24px'],
    //   // lg: ['20px', '28px'],
    //   // xl: ['24px', '32px'],
      '2xs': '.5rem',
      '3xs': '.4rem',
    }
    },
}