import React, { useContext, useEffect, useState, ElementType } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography, { TypographyProps } from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import SiteContext from '../SiteContext';
import SectionContext from '../SectionContext';
// import Link from '../Link';
import { Link as ScrollLink } from 'react-scroll';
import { pruneClasses } from '../../utils/classes';
import PageContext from '../PageContext';
import { TocItems } from '../../types/pageTypes';

const useStyles = makeStyles((theme) => ({
  'NavContentToc-root': {
    width: '100%',
    '& .MuiAccordionSummary-root,': {
      padding: 0,
      minHeight: 0
    },
    '& .MuiAccordionSummary-content': {
      margin: 0
    },
    '& .MuiAccordionDetails-root': {
      padding: 0
    }
  },
  'NavContentToc-label': {},
  'NavContentToc-list': {
    justifyContent: 'space-around',
    listStyle: 'none',
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(1),
    '& li::before': {
      content: '\u200B'
    },
    '& li': {
      '& :not(.active)': {
        borderLeft: `4px solid ${theme.palette.background.default}`
      },
      '& .active': {
        borderLeft: `4px solid ${theme.palette.primary.main}`
      }
    }
  },
  'NavContentToc-item': {},
  'NavContentToc-link': {
    color: theme.palette.primary.main,
    textDecorationLine: 'none',
    '&:hover': {
      textDecorationLine: 'underline'
    }
  }
}));
const classNames = [
  'NavContentToc-root',
  'NavContentToc-label',
  'NavContentToc-list',
  'NavContentToc-item',
  'NavContentToc-link'
];

export type NavContentTocComponent = {
  navContentTocComponent: React.ElementType<React.HTMLAttributes<HTMLElement>>;
  navContentTocLabelComponent: ElementType<any>;
};
export type NavContentTocVariant = {
  navContentTocLabelVariant: TypographyProps['variant'];
};

type Props = {
  expanded?: boolean;
  classes?: { [key: string]: string };
};
const NavContentTocItems = ({
  items,
  visibleId,
  classes: inClasses
}: Props & { items: TocItems; visibleId: string }) => {
  const classes = useStyles({ classes: pruneClasses(inClasses, classNames) });
  return (
    <ul className={classes['NavContentToc-list']}>
      {items.map(({ id, label, items }) => (
        <li key={id}>
          <Typography
            component="span"
            className={`${classes['NavContentToc-item']}${
              visibleId === id ? ' active' : ''
            }`}
          >
            <ScrollLink
              href={`#${id}`}
              to={`${id}`}
              smooth={true}
              duration={500}
              onClick={(): void => {
                //const a = e.target as HTMLAnchorElement;
                window.history.pushState({}, '', `#${id}`);
              }}
              className={classes['NavContentToc-link']}
            >
              {label}
            </ScrollLink>
          </Typography>
          {items.length > 0 && (
            <NavContentTocItems
              items={items}
              visibleId={visibleId}
              classes={classes}
            />
          )}
        </li>
      ))}
    </ul>
  );
};

const NavContentToc = ({ expanded = false, classes: inClasses }: Props) => {
  const classes = useStyles({ classes: pruneClasses(inClasses, classNames) });
  const { contentToc } = useContext(PageContext);
  const { labels } = useContext(SiteContext);
  const { component, variant } = useContext(SectionContext);
  const [visibleId, setVisibleId] = useState(
    contentToc.items.length > 0 ? contentToc.items[0].id : ''
  );
  useEffect(() => {
    const scroller = window;
    const tocIds: string[] = [];
    contentToc.items.forEach((v) => {
      tocIds.push(v.id);
      // ???????????????.
      v.items.forEach(({ id }) => tocIds.push(id));
    });
    const elms: Element[] = [];
    let timerId: any = 0;
    const handleScroll = () => {
      if (timerId !== 0) {
        clearTimeout(timerId);
      }
      timerId = setTimeout(() => {
        const top = 0;
        const bottom = scroller.innerHeight;
        const idx = elms.findIndex((e) => {
          const rect = e.getBoundingClientRect();
          if (top < rect.top && rect.bottom < bottom) {
            return true;
          }
          return false;
        });
        if (idx >= 0) {
          setVisibleId(elms[idx].id);
        } else {
          const rect = elms[0].getBoundingClientRect();
          if (rect.top >= 0) {
            setVisibleId(elms[0].id);
          } else {
            setVisibleId(elms[elms.length - 1].id);
          }
        }
        timerId = 0;
      }, 100);
    };
    tocIds.forEach((id) => {
      const e = document.querySelector(`#${id}`);
      if (e) {
        elms.push(e);
      }
    });
    if (elms.length > 0) {
      scroller.addEventListener('scroll', handleScroll);
    }
    return () => {
      if (timerId !== 0) {
        clearTimeout(timerId);
      }
      if (elms.length > 0) {
        scroller.removeEventListener('scroll', handleScroll);
      }
    };
  }, [contentToc.items]);
  return (
    <Accordion
      component={component.navContentTocComponent}
      elevation={0}
      className={classes['NavContentToc-root']}
      aria-labelledby="table-of-contens-navigation"
      // defaultExpanded={expanded}
      expanded={expanded === true ? true : undefined}
    >
      <AccordionSummary
        expandIcon={expanded ? '' : <ExpandMoreIcon />}
        aria-label="Expand"
        aria-controls="additional-actions-table-of-contents"
        id="table-of-contents-header"
      >
        <Typography
          variant={variant.navContentTocLabelVariant}
          component={component.navContentTocLabelComponent}
          className={classes['NavContentToc-label']}
        >
          {labels.tocLabel || contentToc.label}
        </Typography>
      </AccordionSummary>
      <AccordionDetails>
        <NavContentTocItems
          items={contentToc.items}
          visibleId={visibleId}
          classes={classes}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default NavContentToc;
