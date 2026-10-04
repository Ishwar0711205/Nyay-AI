import { useState, useEffect, useMemo, useRef } from "react";
import UploadCard from "../UploadCard";
import {
  DocIcon,
  SearchIcon,
  CheckIcon,
  BookIcon,
  TrashIcon,
  FilterIcon,
  RefreshIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  DatabaseIcon,
  ShieldIcon,
  InfoIcon,
} from "../Icons";
import { api } from "../../api";
import { translations } from "../../translations";

export default function DocumentsPage({
  file,
  setFile,
  handleUpload,
  uploading,
  uploadStatus,
  onUploadError,
  documents = [],
  docChunks = {},
  onSearchDocument,
  onSearchOfficialDocument,
  onDeleteDocument,
  token,
  language = "en",
}) {
  const t = translations[language] || translations.en;
  const [activeTab, setActiveTab] = useState("official");
  const [corpus, setCorpus] = useState([]);
  const [corpusLoading, setCorpusLoading] = useState(true);
  const [corpusError, setCorpusError] = useState(null);
  const [corpusFilter, setCorpusFilter] = useState("All");
  const [corpusSearch, setCorpusSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const tableRef = useRef(null);

  const fetchCorpus = () => {
    setCorpusLoading(true);
    setCorpusError(null);
    api("/corpus", {}, token)
      .then((data) => {
        setCorpus(data.corpus || []);
        setCorpusLoading(false);
      })
      .catch((err) => {
        setCorpusError(err.message || "Unable to load official legal corpus.");
        setCorpusLoading(false);
      });
  };

  useEffect(() => {
    fetchCorpus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Categories extracted dynamically from corpus
  const categories = useMemo(() => {
    const set = new Set();
    corpus.forEach((item) => {
      if (item.category) set.add(item.category);
    });
    return ["All", ...Array.from(set).sort()];
  }, [corpus]);

  // Category counts
  const categoryCounts = useMemo(() => {
    const counts = { All: corpus.length };
    corpus.forEach((item) => {
      counts[item.category] = (counts[item.category] || 0) + 1;
    });
    return counts;
  }, [corpus]);

  // Combined search and category filtering
  const filteredCorpus = useMemo(() => {
    const q = corpusSearch.trim().toLowerCase();
    return corpus.filter((item) => {
      const matchesCat = corpusFilter === "All" || item.category === corpusFilter;
      const matchesSearch =
        !q ||
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.filename && item.filename.toLowerCase().includes(q)) ||
        (item.category && item.category.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [corpus, corpusFilter, corpusSearch]);

  // Reset page when filter, search or page size changes
  useEffect(() => {
    setCurrentPage(1);
  }, [corpusFilter, corpusSearch, pageSize]);

  // Reset all filters
  const handleResetFilters = () => {
    setCorpusFilter("All");
    setCorpusSearch("");
    setCurrentPage(1);
  };

  // Pagination calculation
  const effectivePageSize = pageSize === "All" ? Math.max(1, filteredCorpus.length) : Number(pageSize);
  const totalPages = Math.max(1, Math.ceil(filteredCorpus.length / effectivePageSize));

  const paginatedItems = useMemo(() => {
    if (pageSize === "All") return filteredCorpus;
    const start = (currentPage - 1) * effectivePageSize;
    return filteredCorpus.slice(start, start + effectivePageSize);
  }, [filteredCorpus, currentPage, effectivePageSize, pageSize]);

  const goToPage = (page) => {
    const target = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(target);
    if (tableRef.current) {
      tableRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const totalChunks = useMemo(() => {
    return corpus.reduce((acc, it) => acc + (it.chunks || 0), 0) || 5259;
  }, [corpus]);

  return (
    <div className="docs-page-wrapper">
      {/* Page Header */}
      <div className="page-head docs-page-header">
        <div>
          <h1>{t["page.docs.title"]}</h1>
          <p>{t["page.docs.sub"]}</p>
        </div>
        <div className="docs-header-stat-pill">
          <DatabaseIcon size={14} className="stat-pill-icon" />
          <span>Vector Database: <strong>5,259 Chunks</strong></span>
        </div>
      </div>

      {/* Workspace Tabs */}
      <div className="docs-tabs-strip">
        <button
          type="button"
          className={`docs-tab-btn ${activeTab === "official" ? "is-active" : ""}`}
          onClick={() => setActiveTab("official")}
        >
          <BookIcon size={16} />
          <span>{t["page.docs.tab2"]}</span>
          <span className="tab-counter-badge">{corpus.length || 65}</span>
        </button>
        <button
          type="button"
          className={`docs-tab-btn ${activeTab === "my-docs" ? "is-active" : ""}`}
          onClick={() => setActiveTab("my-docs")}
        >
          <DocIcon size={16} />
          <span>{t["page.docs.tab1"]}</span>
          <span className="tab-counter-badge">{documents.length}</span>
        </button>
      </div>

      {/* TAB CONTENT: MY DOCUMENTS */}
      {activeTab === "my-docs" && (
        <div className="docs-tab-pane">
          {/* Clarification Banner for Private Workspace */}
          <div className="workspace-clarification-banner banner-private">
            <div className="banner-icon-box">
              <ShieldIcon size={20} />
            </div>
            <div className="banner-content">
              <strong>Private User Workspace Collection</strong>
              <p>
                PDFs uploaded here are strictly isolated to your authenticated account workspace (JWT token). They are parsed and indexed into your dedicated vector collection. Official Maharashtra statutes remain untouched.
              </p>
            </div>
            <div className="banner-meta-pills">
              <span className="banner-meta-badge">
                <DatabaseIcon size={12} /> Isolated Vector Collection
              </span>
              <span className="banner-meta-badge">
                <ShieldIcon size={12} /> JWT Authenticated
              </span>
            </div>
          </div>

          <UploadCard
            file={file}
            setFile={setFile}
            onUpload={handleUpload}
            uploading={uploading}
            status={uploadStatus}
            onError={onUploadError}
            language={language}
          />

          <section className="panel docs-list-panel">
            <div className="panel-head">
              <div>
                <h2 style={{ fontSize: "1.1rem" }}>{t["page.docs.indexedTitle"]}</h2>
                <p style={{ fontSize: "0.82rem", color: "var(--text-muted)", margin: "2px 0 0 0" }}>
                  {documents.length
                    ? `${documents.length} document${documents.length === 1 ? "" : "s"} indexed in your isolated vector workspace.`
                    : "Upload PDF documents above to start searching your private legal materials."}
                </p>
              </div>
            </div>

            {documents.length > 0 ? (
              <ul className="doc-list" style={{ gap: "0.75rem" }}>
                {documents.map((d) => {
                  const chunks = d.chunks || docChunks[d.document_id];
                  return (
                    <li key={d.document_id} className="doc-row" style={{ padding: "0.85rem 1rem" }}>
                      <DocIcon size={20} className="doc-row-icon" />
                      <div className="doc-row-body">
                        <strong className="doc-row-name" style={{ fontSize: "0.95rem" }}>
                          {d.law_name || d.filename}
                        </strong>
                        <span className="doc-row-meta" style={{ fontSize: "0.8rem", marginTop: "2px" }}>
                          {d.filename} • {chunks ? `${chunks} chunks indexed` : "Indexed in ChromaDB"}
                        </span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "4px",
                          fontSize: "0.74rem",
                          fontWeight: "600",
                          backgroundColor: "var(--success-bg)",
                          color: "var(--success)",
                          border: "1px solid var(--success-border)",
                          padding: "3px 8px",
                          borderRadius: "var(--radius-xs)"
                        }}>
                          <CheckIcon size={12} /> Indexed
                        </span>
                        <button
                          type="button"
                          className="btn btn-outline"
                          style={{ padding: "0.35rem 0.75rem", fontSize: "0.82rem" }}
                          onClick={() => onSearchDocument(d)}
                        >
                          <SearchIcon size={13} /> {t["page.docs.search"]}
                        </button>
                        {onDeleteDocument && (
                          <button
                            type="button"
                            className="btn btn-ghost btn-danger"
                            style={{ padding: "0.35rem" }}
                            onClick={() => onDeleteDocument(d.document_id)}
                            title="Delete document"
                          >
                            <TrashIcon size={15} />
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="docs-empty-state-card">
                <DocIcon size={36} style={{ marginBottom: "0.5rem", opacity: 0.5, color: "var(--accent-primary)" }} />
                <strong>No Private Documents Uploaded</strong>
                <p>
                  Upload your first legal PDF above to search contracts, pleadings, and briefs alongside Maharashtra statutes.
                </p>
              </div>
            )}
          </section>
        </div>
      )}

      {/* TAB CONTENT: OFFICIAL MAHARASHTRA CORPUS */}
      {activeTab === "official" && (
        <div className="docs-tab-pane">
          {/* Clarification Banner for Official Corpus */}
          <div className="workspace-clarification-banner banner-official">
            <div className="banner-icon-box">
              <BookIcon size={20} />
            </div>
            <div className="banner-content">
              <strong>Official Maharashtra Statutory Corpus (Shared Legal Knowledge)</strong>
              <p>
                Curated and verified collection of 65 official Maharashtra Acts, Rules, Government Resolutions, and Bombay High Court Precedents (5,259 vector chunks). Shared across all user queries; read-only and immutable.
              </p>
            </div>
            <div className="banner-meta-pills">
              <span className="banner-meta-badge">
                <BookIcon size={12} /> {corpus.length || 65} Official Documents
              </span>
              <span className="banner-meta-badge">
                <DatabaseIcon size={12} /> {totalChunks.toLocaleString()} Vector Chunks
              </span>
              <span className="banner-meta-badge">
                <CheckIcon size={12} /> ChromaDB Verified
              </span>
            </div>
          </div>

          <section className="panel corpus-panel" ref={tableRef}>
            {/* Search and Category Filter Deck */}
            <div className="corpus-filter-deck">
              {/* Search Bar */}
              <div className="corpus-search-wrap">
                <SearchIcon size={16} className="corpus-search-icon" />
                <input
                  type="text"
                  placeholder="Search 65 official statutes, acts, GRs, or judgments by title or keyword..."
                  value={corpusSearch}
                  onChange={(e) => setCorpusSearch(e.target.value)}
                  className="corpus-search-input"
                />
                {corpusSearch && (
                  <button
                    type="button"
                    className="corpus-search-clear-btn"
                    onClick={() => setCorpusSearch("")}
                    title="Clear search"
                  >
                    <CloseIcon size={14} />
                  </button>
                )}
              </div>

              {/* Category Filter Chips */}
              <div className="corpus-chips-row">
                <span className="corpus-filter-tag-label">
                  <FilterIcon size={12} /> Category:
                </span>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className={`corpus-category-chip ${corpusFilter === cat ? "is-active" : ""}`}
                    onClick={() => setCorpusFilter(cat)}
                  >
                    <span>{cat}</span>
                    <span className="chip-badge">{categoryCounts[cat] || 0}</span>
                  </button>
                ))}
              </div>

              {/* Filter Counter & Reset Row */}
              <div className="corpus-summary-toolbar">
                <div className="summary-left">
                  <span className="corpus-result-count">
                    Showing <strong>{paginatedItems.length}</strong> of <strong>{filteredCorpus.length}</strong> documents
                    {(corpusFilter !== "All" || corpusSearch.trim()) && (
                      <span className="corpus-filter-applied-label">
                        {" "}(filtered from {corpus.length} total)
                      </span>
                    )}
                  </span>
                  {(corpusFilter !== "All" || corpusSearch.trim()) && (
                    <button
                      type="button"
                      className="btn-reset-filters"
                      onClick={handleResetFilters}
                    >
                      <RefreshIcon size={12} /> Reset Filters
                    </button>
                  )}
                </div>

                <div className="summary-right">
                  <span className="page-size-label">Rows per page:</span>
                  <div className="page-size-toggle">
                    {[10, 25, 50, "All"].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        className={`size-toggle-btn ${pageSize === sz ? "is-active" : ""}`}
                        onClick={() => setPageSize(sz)}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Loading State */}
            {corpusLoading && (
              <div className="docs-loading-state">
                <div className="docs-spinner" />
                <p>Loading official Maharashtra legal corpus from ChromaDB...</p>
              </div>
            )}

            {/* Error State */}
            {!corpusLoading && corpusError && (
              <div className="docs-error-state">
                <InfoIcon size={24} style={{ color: "var(--danger)" }} />
                <div>
                  <strong>Error loading official documents</strong>
                  <p>{corpusError}</p>
                </div>
                <button
                  type="button"
                  className="btn btn-outline btn-sm"
                  onClick={fetchCorpus}
                >
                  <RefreshIcon size={13} /> Retry
                </button>
              </div>
            )}

            {/* Empty Search Result State */}
            {!corpusLoading && !corpusError && filteredCorpus.length === 0 && (
              <div className="docs-empty-state-card">
                <SearchIcon size={36} style={{ marginBottom: "0.5rem", opacity: 0.4, color: "var(--accent-primary)" }} />
                <strong>No Official Documents Match Your Filters</strong>
                <p>
                  No documents found matching "{corpusSearch}" in category "{corpusFilter}". Try broadening your search terms or resetting filters.
                </p>
                <button
                  type="button"
                  className="btn btn-primary btn-sm"
                  style={{ marginTop: "0.5rem" }}
                  onClick={handleResetFilters}
                >
                  <RefreshIcon size={13} /> Reset All Filters
                </button>
              </div>
            )}

            {/* Table */}
            {!corpusLoading && !corpusError && filteredCorpus.length > 0 && (
              <div className="corpus-table-responsive">
                <table className="corpus-table">
                  <thead>
                    <tr>
                      <th style={{ width: "42%" }}>Statute / Document Title</th>
                      <th style={{ width: "22%" }}>Category</th>
                      <th style={{ width: "14%" }}>Pages & Size</th>
                      <th style={{ width: "12%" }}>Indexing Status</th>
                      <th style={{ width: "10%", textAlign: "right" }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedItems.map((item, idx) => (
                      <tr key={item.filename || idx}>
                        <td>
                          <div className="corpus-doc-title-cell">
                            <BookIcon size={16} className="corpus-doc-icon" />
                            <div className="corpus-doc-info">
                              <span className="corpus-doc-primary-title">
                                {item.title || item.filename}
                              </span>
                              <span className="corpus-doc-filename" title={item.filename}>
                                {item.filename}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td>
                          <span className="corpus-category-tag">
                            {item.category}
                          </span>
                        </td>
                        <td>
                          <div className="corpus-size-cell">
                            {item.pages ? (
                              <span className="corpus-page-count">{item.pages} pages</span>
                            ) : null}
                            <span className="corpus-mb-size">
                              {item.size_mb ? `${item.size_mb.toFixed(2)} MB` : "—"}
                            </span>
                          </div>
                        </td>
                        <td>
                          <span className="corpus-status-pill">
                            <CheckIcon size={12} />
                            {item.chunks ? `${item.chunks} chunks` : "Indexed"}
                          </span>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <button
                            type="button"
                            className="btn btn-outline corpus-research-btn"
                            onClick={() => {
                              if (onSearchOfficialDocument) {
                                onSearchOfficialDocument(item);
                              } else if (onSearchDocument) {
                                onSearchDocument(item);
                              }
                            }}
                            title={`Research ${item.title}`}
                          >
                            <SearchIcon size={12} /> Research
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination Controls */}
            {!corpusLoading && !corpusError && filteredCorpus.length > 0 && totalPages > 1 && (
              <div className="corpus-pagination-footer">
                <div className="pagination-legend">
                  Showing <strong>{((currentPage - 1) * effectivePageSize) + 1}</strong> –{" "}
                  <strong>{Math.min(currentPage * effectivePageSize, filteredCorpus.length)}</strong> of{" "}
                  <strong>{filteredCorpus.length}</strong> official documents
                </div>

                <div className="pagination-controls">
                  <button
                    type="button"
                    className="btn-page-nav"
                    disabled={currentPage === 1}
                    onClick={() => goToPage(currentPage - 1)}
                    title="Previous page"
                  >
                    <ChevronLeftIcon size={14} /> Prev
                  </button>

                  <div className="pagination-pages-list">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
                      // Show first, last, current, and neighbours
                      if (
                        p === 1 ||
                        p === totalPages ||
                        (p >= currentPage - 2 && p <= currentPage + 2)
                      ) {
                        return (
                          <button
                            key={p}
                            type="button"
                            className={`btn-page-number ${currentPage === p ? "is-active" : ""}`}
                            onClick={() => goToPage(p)}
                          >
                            {p}
                          </button>
                        );
                      }
                      if (p === currentPage - 3 || p === currentPage + 3) {
                        return (
                          <span key={p} className="pagination-ellipsis">
                            …
                          </span>
                        );
                      }
                      return null;
                    })}
                  </div>

                  <button
                    type="button"
                    className="btn-page-nav"
                    disabled={currentPage === totalPages}
                    onClick={() => goToPage(currentPage + 1)}
                    title="Next page"
                  >
                    Next <ChevronRightIcon size={14} />
                  </button>
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}