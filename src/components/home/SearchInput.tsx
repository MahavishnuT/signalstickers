import debounceFn from 'debounce-fn';
import { styled } from 'linaria/react';
import React from 'react';
import ToggleSwitch from './ToggleSwitch';
import { HashLink } from 'react-router-hash-link';
import { BsSearch, BsX } from 'react-icons/bs';
import { FaInfoCircle } from 'react-icons/fa';

import StickersContext from 'contexts/StickersContext';
import { DANGER_SATURATED, GRAY_DARKER_2 } from 'etc/colors';


// ----- Styles ----------------------------------------------------------------

const SearchInput = styled.div`
  position: relative;

  & input {
    padding-left: 42px;
    padding-right: 72px;
  }

  & input:focus,
  & button:active:focus {
    box-shadow: none;
    outline: none;
  }

  & label {
    cursor: pointer;
  }
`;

const SearchPrepend = styled.div`
  align-items: center;
  display: flex;
  font-size: 18px;
  height: 100%;
  left: 0;
  padding-left: 14px;
  position:absolute;
  top: 0;
  transition: color 0.2s ease-in-out;
  z-index: 3;
`;

const SearchHelp = styled.div`
  align-items: center;
  display: flex;
  height: 100%;
  opacity: 0;
  padding: 3px 4px 0px 4px;
  pointer-events: none;
  position: absolute;
  right: 50px;
  top: -2px;
  transition: opacity 0.2s ease-in-out;
  transform: translateY(2px);
  z-index: 3;

  & a {
    opacity: 0.3;
    transition: opacity 0.15s ease-in-out;

    &:hover {
      opacity: 0.5;
    }
  }

  & .icon {
    font-size: 18px;
  }
`;

const SearchClear = styled.div`
  position:absolute;
  display: flex;
  align-items: center;
  height: 100%;
  right: 0;
  top: 0;
  padding-right: 4px;
  z-index: 3;

  & button {
    font-size: 20px;

    & .icon {
      opacity: 0.8;
      color: ${DANGER_SATURATED};
      transition: opacity 0.2s ease-in-out, transform 0.1s ease;
      transform: scale(1.5);
    }

    &:hover .icon {
      opacity: 1;
      transform: scale(1.6);
    }

    &:active {
      box-shadow: none;
      outline: none;

      & .icon {
        transform: scale(1.5);
      }
    }

    &:focus {
      box-shadow: none;
      outline: none;
    }
  }

  .theme-dark & {
    & .icon {
      opacity: 0.6;
    }
  }
`;

const MiniTag = styled.button`
  background-color: transparent;
  border: 1px solid var(--primary);
  color: var(--primary);
  font-size: 12px;
  font-weight: 700;
  padding: 0 5px;

  &:hover {
    color: var(--primary);

    &:active {
      border-color: var(--primary) !important;
    }
  }

  &:focus {
    box-shadow: 0 0 0 0.12rem rgba(var(--primary), 0.25);
  }

  .theme-dark & {
    background-color: ${GRAY_DARKER_2};
  }
`;

const MiniAnimated = styled(MiniTag)`
  border: 1px solid var(--orange);
  color: var(--orange);
`;

const MiniEditorschoice = styled(MiniTag)`
  border: 1px solid #9400d3;
  color: #9400d3;
`;

// ----- Component -------------------------------------------------------------

const SearchInputComponent: React.FunctionComponent = () => {
  const { searcher, searchQuery, searchResults, setSearchQuery, sortOrder, setSortOrder, setShowNsfw} = React.useContext(StickersContext);
  const [searchQueryInputValue, setSearchQueryInputValue] = React.useState('');
  const searchHelpRef = React.useRef<HTMLDivElement>(null);
  const suggestedTags = ['cute', 'privacy', 'meme', 'for children'];


  /**
   * Allows us to de-bounce calls to setSearchQuery to avoid making excessive
   * re-renders when the input value is updated.
   */
  const debouncedSetSearchQuery = debounceFn(setSearchQuery, { wait: 250 });


  /**
   * [Effect] Context state -> local/input state.
   */
  React.useEffect(() => {
    if (searchQuery) {
      setSearchQueryInputValue(searchQuery);
    }
  }, [searchQuery]);


  /**
   * [Event Handler] Input state -> local state.
   */
  const onSearchQueryInputChange = React.useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = event.target;
    setSearchQueryInputValue(value);
  }, [
    setSearchQueryInputValue
  ]);

  /**
   * [Event Handler] Input order state -> local state.
   */
  const onSortOrderChange = React.useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const { value } = event.target;
    setSortOrder(value);
  }, [
    setSortOrder
  ]);


  /**
   * [Effect] Local state -> context state (debounced).
   */
  React.useEffect(() => {
    debouncedSetSearchQuery.cancel();
    debouncedSetSearchQuery(searchQueryInputValue);

    return () => {
      debouncedSetSearchQuery.cancel();
    };
  }, [
    debouncedSetSearchQuery,
    searchQueryInputValue
  ]);


  /**
   * [Event Handler] Sets the search query when a tag or the 'animated'
   * suggestion is clicked.
   */
  const onSuggestionClick = React.useCallback((event: React.SyntheticEvent) => {
    if (searcher && event.currentTarget.textContent) {
      switch (event.currentTarget.getAttribute('data-suggestion-type')) {
        case 'tag': {
          setSearchQuery(searcher.buildQueryString({
            attributeQueries: [{
              tag: event.currentTarget.textContent
            }]
          }));
          break;
        }
        case 'animated': {
          setSearchQuery(searcher.buildQueryString({
            attributeQueries: [{
              animated: 'true'
            }]
          }));
          break;
        }
        case 'editorschoice': {
          setSearchQuery(searcher.buildQueryString({
            attributeQueries: [{
              editorschoice: 'true'
            }]
          }));
          break;
        }
      }
    }
  }, [
    searcher,
    setSearchQuery
  ]);


  /**
   * [Event Handler] Show the search help icon when the input element is
   * focused.
   */
  const handleInputFocus = React.useCallback(() => {
    if (!searchHelpRef.current) {
      return;
    }

    searchHelpRef.current.style.opacity = '1';
    searchHelpRef.current.style.pointerEvents = 'initial';
  }, [
    searchHelpRef
  ]);


  /**
   * [Event Handler] Hide the search help icon when the input element is
   * blurred. We also disable pointer events to prevent clicking on the element
   * when it is not visible.
   */
  const handleInputBlur = React.useCallback(() => {
    if (!searchHelpRef.current) {
      return;
    }

    searchHelpRef.current.style.opacity = '0';

    // Allows a click on the search help icon to proceed before disabling
    // pointer events.
    setTimeout(() => {
      if (!searchHelpRef.current) {
        return;
      }

      searchHelpRef.current.style.pointerEvents = 'none';
    }, 250);
  }, [
    searchHelpRef
  ]);


  /**
   * [Event Handler] Clears our context's search query state.
   */
  const clearSearchResults = React.useCallback((event: React.SyntheticEvent) => {
    event.preventDefault();
    setSearchQueryInputValue('');
    setSearchQuery('');
  }, [
    setSearchQueryInputValue,
    setSearchQuery
  ]);

  /**
   * [Event Handler] Change either to show NSFW
   */
  const onNsfwToggle = (state: boolean) => {
    setShowNsfw(state);
  };


  /**
   * [Effect] When the component mounts, set the search input's value to the
   * current search query from our context.
   */
  React.useEffect(() => {
    if (searchQuery) {
      setSearchQueryInputValue(searchQuery);
    }
  }, [searchQuery]);


  /**
   * [Effect] When the search query is updated, call our de-bounced update
   * function.
   */
  React.useEffect(() => {
    debouncedSetSearchQuery.cancel();
    debouncedSetSearchQuery(searchQueryInputValue);

    return () => {
      debouncedSetSearchQuery.cancel();
    };
  }, [
    debouncedSetSearchQuery,
    searchQueryInputValue
  ]);


  /**
   * [Memo] JSX fragment containing the set of suggested tags.
   */
  const tagsFragment = React.useMemo(() => suggestedTags.map(tag => (
    <MiniTag
      type="button"
      key={tag}
      className="btn mr-1"
      onClick={onSuggestionClick}
      data-suggestion-type="tag"
    >
      {tag}
    </MiniTag>
  )), [suggestedTags]);


  // ----- Render --------------------------------------------------------------

  return (
    <SearchInput className="form-group mb-4">
      <div className="mb-1 position-relative">
        <SearchPrepend>
          <BsSearch />
        </SearchPrepend>
        <input
          type="text"
          key="search"
          className="form-control form-control-lg"
          onBlur={handleInputBlur}
          onChange={onSearchQueryInputChange}
          onFocus={handleInputFocus}
          value={searchQueryInputValue}
          title="Search"
          aria-label="search"
          autoComplete="off"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck="false"
        />
        <SearchHelp ref={searchHelpRef}>
          <HashLink to="/about#searching" title="Search Help">
            <FaInfoCircle className="text-muted" />
          </HashLink>
        </SearchHelp>
        <SearchClear>
          <button
            type="button"
            className="btn btn-link border-0"
            title="Clear Search Results"
            onClick={clearSearchResults}
          >
            <BsX />
          </button>
        </SearchClear>
      </div>
      <div className="d-flex justify-content-between">
        <div>
          <small>
            Suggested: {' '}
          </small>
          <br className="d-inline d-md-none" />
          <MiniAnimated
            type="button"
            className="btn mr-1"
            onClick={onSuggestionClick}
            data-suggestion-type="animated"
          >
            Animated
          </MiniAnimated>
          <MiniEditorschoice
            type="button"
            className="btn mr-1"
            onClick={onSuggestionClick}
            data-suggestion-type="editorschoice"
          >
            Editor's choice
          </MiniEditorschoice>
          {tagsFragment}
        </div>
        <div className="text-muted">
          <small>
            {searchResults?.length || 0} {searchResults.length === 1 ? 'result' : 'results'}
          </small>
        </div>
      </div>
      <div className="mt-5 d-flex flex-wrap">
        <div className="mr-3">
          Sort by
          <select className="d-inline-block form-control form-control-sm w-auto ml-2" value={searchQuery ? 'relevance' : sortOrder} onChange={onSortOrderChange} disabled={searchQuery !== ''}>
            <option value="">Latest</option>
            <option value="trending">Trending</option>
            <option value="mostViewed">Most viewed (all times)</option>
            {searchQuery &&
              /* Only used as a placeholder when a searchQuery is set */
              <option value="relevance">Relevance</option>
            }

          </select>
        </div>
        <div>
          <label htmlFor="nsfwToggle">
            Show NSFW <ToggleSwitch id="nsfwToggle" onToggle={onNsfwToggle} />
          </label>
        </div>
      </div>
    </SearchInput>
  );
};


export default SearchInputComponent;
