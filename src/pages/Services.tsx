import { useQuery } from '@tanstack/react-query'
import { getServices } from '../api'
import { serviceKeys } from '../queryKeys'

export function Services() {
  const { data } = useQuery({ queryKey: serviceKeys.all, queryFn: getServices })

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">INVENTORY</p>
          <h1>Services</h1>
          <p className="lede">Health and ownership across production.</p>
        </div>
      </div>
      <div className="service-grid">
        {data?.map((service) => (
          <article className="service-card" key={service.name}>
            <div className="service-title">
              <span className={`health health-${service.health}`} />
              <h2>{service.name}</h2>
            </div>
            <p>{service.owner}</p>
            <div className="service-stats">
              <span>
                <b>{service.uptime}%</b> uptime
              </span>
              <span>
                <b>{service.latency}ms</b> latency
              </span>
            </div>
          </article>
        ))}
      </div>
    </>
  )
}
